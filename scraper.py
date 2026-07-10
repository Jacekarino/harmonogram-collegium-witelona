import json
import os
import requests

# pyrefly: ignore [missing-import]
from bs4 import BeautifulSoup
import re
import argparse

BASE_URL = 'http://www.plan.pwsz.legnica.edu.pl/'

def get_html(url):
    response = requests.get(url)
    response.encoding = 'iso-8859-2' # Used for Polish sites
    return response.text

def sanitize_filename(name):
    # Remove invalid characters for Windows paths
    return re.sub(r'[\\/*?:"<>|]', "", name).strip()

def scrape_faculties():
    print("Scrapowanie wydziałów...")
    html = get_html(BASE_URL)
    soup = BeautifulSoup(html, 'html.parser')
    
    faculties = []
    for a in soup.find_all('a', href=True):
        href = a['href']
        if 'site=show_kierunek.php&id=' in href:
            faculty_id = href.split('id=')[-1]
            faculty_name = a.get_text(strip=True)
            faculties.append({
                'faculty_id': faculty_id,
                'faculty_name': faculty_name,
                'specializations': []
            })
            
    seen = set()
    unique_faculties = []
    for f in faculties:
        if f['faculty_id'] not in seen:
            seen.add(f['faculty_id'])
            unique_faculties.append(f)
            
    return unique_faculties

def scrape_specializations(faculty):
    print(f"Scrapowanie kierunku dla wydziału o ID: {faculty['faculty_id']}")
    url = f"{BASE_URL}schedule_view.php?site=show_kierunek.php&id={faculty['faculty_id']}"
    response = requests.get(url)
    response.encoding = 'iso-8859-2'
    soup = BeautifulSoup(response.text, 'html.parser')
    
    specializations = []
    
    ul = soup.find('ul', class_='accordion')
    if ul:
        for li in ul.find_all('li', recursive=False):
            a_tag = li.find('a')
            div_tag = li.find('div')
            if a_tag and div_tag:
                full_spec_name = a_tag.get_text(strip=True)

                # Parse Name and Year out of strings
                match = re.search(r'(.*?)\s+(\d+)\s*-\s*studia stacjonarne', full_spec_name)
                if match:
                    spec_name = match.group(1).strip()
                    year = match.group(2).strip()
                else:
                    spec_name = full_spec_name
                    year = "Unknown"
                
                # Find all group codes for this specialization
                stac_links = div_tag.find_all('a', href=re.compile(r'checkSpecjalnoscStac\.php\?specjalnosc='))
                for stac_link in stac_links:
                    code = stac_link['href'].split('specjalnosc=')[-1]
                    specializations.append({
                        'full_name': full_spec_name,
                        'name': spec_name,
                        'year': year,
                        'code': code
                    })
    
    faculty['specializations'] = specializations
    return faculty

def scrape_schedule(code):
    print(f"Scrapowanie pliku z harmonogramem dla grupy: {code}")
    url = f"{BASE_URL}checkSpecjalnoscStac.php?specjalnosc={code}"
    response = requests.get(url)
    response.encoding = 'iso-8859-2'
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Parse "skrót" & "legenda" tables into the main table
    shortcuts = {}
    legendas = {}
    tables = soup.find_all('table')
    for table in tables:
        th_tags = table.find_all('th')
        th_texts = [th.get_text(strip=True).lower() for th in th_tags]
        
        if 'skrot' in th_texts or 'skrót' in th_texts:
            for tr in table.find_all('tr'):
                tds = tr.find_all('td')
                if len(tds) >= 2:
                    skrot = tds[0].get_text(strip=True)
                    nazwa = tds[1].get_text(strip=True)
                    if skrot and nazwa:
                        shortcuts[skrot] = nazwa
        
        elif any('legenda' in text for text in th_texts):
            leg_name = next(text for text in th_texts if 'legenda' in text).lower()
            leg_data = []
            for tr in table.find_all('tr'):
                tds = tr.find_all(['td', 'th'])
                if len(tds) >= 3 and tds[0].get_text(strip=True).lower() != 'przedmiot':
                    leg_data.append({
                        'subject': tds[0].get_text(strip=True),
                        'teacher': tds[1].get_text(strip=True),
                        'room': tds[2].get_text(strip=True)
                    })
            legendas[leg_name] = leg_data

    table = soup.find('table', class_='TabPlan')
    if not table:
        print(f"Nie znaleziono harmonogramu dla {code}.")
        return None
        
    tds = table.find_all(['td', 'th'])
    
    idx = 0
    groups = []
    
    # Find headers
    while idx < len(tds):
        cls = tds[idx].get('class') or []
        if 'nazwaSpecjalnosci' in cls:
            break
        idx += 1
        
    while idx < len(tds):
        cls = tds[idx].get('class') or []
        if 'nazwaSpecjalnosci' in cls:
            groups.append(tds[idx].get_text(strip=True))
            idx += 1
        else:
            break
            
    if not groups:
        return None
        
    schedule_data = {g: {} for g in groups}
    current_day = None
    
    # Extract schedule linearly by iterating over all TDs
    while idx < len(tds):
        td = tds[idx]
        cls = td.get('class') or []
        
        if 'nazwaDnia' in cls:
            current_day = td.get_text(strip=True)
            for g in groups:
                if current_day not in schedule_data[g]:
                    schedule_data[g][current_day] = []
            idx += 1
            continue
            
        if 'nazwaSpecjalnosci' in cls:
            idx += 1
            continue
            
        if 'godzina' in cls:
            time_slot = td.get_text(strip=True)
            idx += 1
            
            for g in groups:
                if idx + 2 < len(tds):
                    class_name = tds[idx].get_text(strip=True)
                    teacher = tds[idx+1].get_text(strip=True)
                    room = tds[idx+2].get_text(strip=True)
                    idx += 3
                    
                    if class_name not in ['-', '']:
                        short_name = class_name
                        # Replace class_name using skrót
                        for skrot, nazwa in shortcuts.items():
                            if class_name.startswith(skrot):
                                class_name = class_name.replace(skrot, nazwa, 1)
                                break
                                
                        # Replace teacher and room using legenda
                        teacher_lower = teacher.lower()
                        if 'legenda' in teacher_lower and teacher_lower in legendas:
                            leg_data = legendas[teacher_lower]
                            teachers = []
                            rooms = []
                            for entry in leg_data:
                                if entry['teacher'] and entry['teacher'] != '-':
                                    teachers.append(entry['teacher'])
                                if entry['room'] and entry['room'] != '-':
                                    rooms.append(entry['room'])
                            if teachers:
                                teacher = " / ".join(teachers)
                                room = " / ".join(rooms)
                        
                        if current_day:
                            schedule_data[g][current_day].append({
                                "time": time_slot,
                                "class_name": class_name,
                                "short_name": short_name,
                                "teacher": teacher,
                                "room": room
                            })
                else:
                    break
            continue
            
        idx += 1
        
    return schedule_data

def main():
    parser = argparse.ArgumentParser(description="Scraper by Jacekarino")
    parser.add_argument('--all', action='store_true', help="Pobiera wszystko")
    parser.add_argument('--faculty', type=str, help="Filtruj według nazwy wydziału")
    parser.add_argument('--specialization', type=str, help="Filtruj według kierunku")
    parser.add_argument('--year', type=str, help="Filtruj według roku")
    parser.add_argument('--code', type=str, help="Filtruj według specjalizacji")
    parser.add_argument('--subgroup', type=str, help="Filtruj według grupy")
    args = parser.parse_args()
    
    # If no filters provided, default to all
    if not any([args.all, args.faculty, args.specialization, args.year, args.code, args.subgroup]):
        args.all = True

    # Always fetch list_faculties first to have the latest index
    faculties = scrape_faculties()
    for faculty in faculties:
        scrape_specializations(faculty)
        
    os.makedirs('data', exist_ok=True)
    with open(os.path.join('data', 'list_faculties.json'), 'w', encoding='utf-8') as f:
        json.dump({"faculties": faculties}, f, ensure_ascii=False, indent=4)
    print("Saved data/list_faculties.json")
    
    # Scrape the required schedules based on filters
    for faculty in faculties:

        # Filter by faculty
        if not args.all and args.faculty and args.faculty != faculty['faculty_name']:
            continue
            
        for spec in faculty['specializations']:
            # Filter by specialization
            if not args.all and args.specialization and args.specialization != spec['name']:
                continue
                
            # Filter by year
            if not args.all and args.year and args.year != spec['year']:
                continue
                
            # Filter by code
            if not args.all and args.code and args.code != spec['code']:
                continue
                
            code = spec['code']
            schedule = scrape_schedule(code)
            
            if schedule:
                # Create nested directories
                faculty_dir = sanitize_filename(faculty['faculty_name'])
                spec_dir = sanitize_filename(spec['name'])
                year_dir = sanitize_filename(spec['year'])
                code_dir = sanitize_filename(code)
                
                base_dir = os.path.join(os.getcwd(), 'data', faculty_dir, spec_dir, year_dir, code_dir)
                os.makedirs(base_dir, exist_ok=True)
                
                subgroups_list = []
                
                for group, days in schedule.items():
                    if not args.all and args.subgroup and args.subgroup != group:
                        continue
                        
                    clean_schedule = {group: {d: classes for d, classes in days.items() if classes}}
                    
                    filename = os.path.join(base_dir, f"schedule_{sanitize_filename(group)}.json")
                    with open(filename, 'w', encoding='utf-8') as f:
                        json.dump(clean_schedule, f, ensure_ascii=False, indent=4)
                    print(f"Saved {filename}")
                    
                    subgroups_list.append(group)
                
                if not subgroups_list:
                    continue
                    
                subgroups_filename = os.path.join(base_dir, "subgroups.json")
                if os.path.exists(subgroups_filename):
                    try:
                        with open(subgroups_filename, 'r', encoding='utf-8') as f:
                            existing = json.load(f)
                            subgroups_list = list(set(existing + subgroups_list))
                    except Exception:
                        pass
                        
                with open(subgroups_filename, 'w', encoding='utf-8') as f:
                    json.dump(subgroups_list, f, ensure_ascii=False, indent=4)

if __name__ == '__main__':
    main()
