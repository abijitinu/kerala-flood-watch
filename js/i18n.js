/*
 * English / Malayalam. The English sentence itself is the key: T("No warning") gives
 * "മുന്നറിയിപ്പില്ല" in Malayalam. {name} marks a value filled in at run time.
 *
 * Malayalam is for what people read: messages, advice, alert text and place and river names.
 * App words people know from other apps (Share, Refresh, Guide, Today), section titles, alert
 * colours (Orange alert), units (km, ft, mm, m³/s), dates and the technical numbers stay in
 * English, so those have no entry here and T returns the English.
 *
 * Static text in index.html carries data-i18n (its own text is the key, or the attribute's
 * value when given) and data-i18n-attr="placeholder,title,aria-label" for attributes.
 */
(function () {
  const ML = {
    /* ---------- Page ---------- */
    "Call emergency 112": "അടിയന്തര സഹായത്തിന് 112 വിളിക്കുക",
    "Choose language": "ഭാഷ തിരഞ്ഞെടുക്കുക",
    "Is my area safe from floods?": "എന്റെ പ്രദേശം വെള്ളപ്പൊക്കത്തിൽ നിന്ന് സുരക്ഷിതമാണോ?",
    "Choose your town or village to see the river near you, the dams above and below it, and how the water is changing day by day.":
      "നിങ്ങളുടെ പട്ടണമോ ഗ്രാമമോ തിരഞ്ഞെടുക്കുക. അടുത്തുള്ള പുഴ, അതിന് മുകളിലും താഴെയുമുള്ള ഡാമുകൾ, ഓരോ ദിവസവും വെള്ളം എങ്ങനെ മാറുന്നു എന്നിവ കാണാം.",
    "Your town or village": "നിങ്ങളുടെ പട്ടണം അല്ലെങ്കിൽ ഗ്രാമം",
    "Get the latest dam levels and river forecasts": "ഡാമുകളുടെയും പുഴകളുടെയും ഏറ്റവും പുതിയ വിവരങ്ങൾ എടുക്കുക",
    "Map of the rivers around the chosen place": "തിരഞ്ഞെടുത്ത സ്ഥലത്തിന് ചുറ്റുമുള്ള പുഴകളുടെ ഭൂപടം",

    /* ---------- Guide ---------- */
    "What the colours mean": "നിറങ്ങളുടെ അർത്ഥം",
    "The dam is filling up. No need to worry yet.": "ഡാം നിറഞ്ഞുവരുന്നു. ഇപ്പോൾ പേടിക്കേണ്ടതില്ല.",
    "Water will be let out. Follow instructions to move away from the river.":
      "വെള്ളം തുറന്നുവിടും. പുഴയിൽ നിന്ന് മാറാനുള്ള നിർദ്ദേശങ്ങൾ പാലിക്കുക.",
    "Keep these in one bag": "ഇവ ഒരു ബാഗിൽ സൂക്ഷിക്കുക",
    "If you live near a river, keep a bag packed during the monsoon so you can leave quickly.":
      "പുഴയ്ക്കടുത്താണ് താമസമെങ്കിൽ, പെട്ടെന്ന് മാറാൻ കഴിയുംവിധം മഴക്കാലത്ത് ഒരു ബാഗ് ഒരുക്കി വെക്കുക.",
    "Drinking water": "കുടിവെള്ളം",
    "Dry food": "ഉണങ്ങിയ ഭക്ഷണം",
    "Medicines": "മരുന്നുകൾ",
    "ID & papers in a plastic cover": "തിരിച്ചറിയൽ രേഖകളും പേപ്പറുകളും പ്ലാസ്റ്റിക് കവറിൽ",
    "Torch": "ടോർച്ച്",
    "Charged phone & power bank": "ചാർജ് ചെയ്ത ഫോണും പവർ ബാങ്കും",
    "Spare clothes": "മാറാനുള്ള വസ്ത്രങ്ങൾ",
    "Soap & sanitiser": "സോപ്പും സാനിറ്റൈസറും",
    "✅ Do": "✅ ചെയ്യേണ്ടത്",
    "❌ Don't": "❌ ചെയ്യരുത്",
    "Move old people, children and animals early": "പ്രായമായവരെയും കുട്ടികളെയും മൃഗങ്ങളെയും നേരത്തെ മാറ്റുക",
    "Switch off electricity before leaving": "പോകുന്നതിന് മുമ്പ് വൈദ്യുതി ഓഫ് ചെയ്യുക",
    "Listen to official announcements": "ഔദ്യോഗിക അറിയിപ്പുകൾ ശ്രദ്ധിക്കുക",
    "Go to the nearest relief camp if asked": "ആവശ്യപ്പെട്ടാൽ അടുത്തുള്ള ദുരിതാശ്വാസ ക്യാമ്പിലേക്ക് പോകുക",
    "Walk or drive through flowing water": "ഒഴുകുന്ന വെള്ളത്തിലൂടെ നടക്കുകയോ വണ്ടി ഓടിക്കുകയോ ചെയ്യരുത്",
    "Go to the river to watch or take photos": "കാണാനോ ഫോട്ടോ എടുക്കാനോ പുഴയിലേക്ക് പോകരുത്",
    "Believe or forward unverified messages": "ഉറപ്പില്ലാത്ത സന്ദേശങ്ങൾ വിശ്വസിക്കുകയോ ഫോർവേഡ് ചെയ്യുകയോ അരുത്",
    "Wait until water enters your house": "വീട്ടിൽ വെള്ളം കയറുന്നതുവരെ കാത്തിരിക്കരുത്",

    /* ---------- Footer ---------- */
    "Emergency, police, rescue": "അടിയന്തരം, പോലീസ്, രക്ഷാപ്രവർത്തനം",
    "District disaster control room": "ജില്ലാ ദുരന്തനിവാരണ കൺട്രോൾ റൂം",
    "State disaster control room": "സംസ്ഥാന ദുരന്തനിവാരണ കൺട്രോൾ റൂം",
    "foot.official": "<strong>ജില്ലാ കളക്ടറുടെയും പ്രാദേശിക ഉദ്യോഗസ്ഥരുടെയും നിർദ്ദേശങ്ങൾ എപ്പോഴും പാലിക്കുക.</strong> സാഹചര്യം മനസ്സിലാക്കാൻ ഈ വെബ്സൈറ്റ് സഹായിക്കും, പക്ഷേ ഇത് ഔദ്യോഗിക ഉത്തരവുകൾക്ക് പകരമല്ല.",
    "foot.sources": "ഔദ്യോഗിക വിവരങ്ങൾ: <a href=\"https://sdma.kerala.gov.in\" target=\"_blank\" rel=\"noopener\">കേരള സംസ്ഥാന ദുരന്തനിവാരണ അതോറിറ്റി</a> · <a href=\"https://ffs.india-water.gov.in\" target=\"_blank\" rel=\"noopener\">കേന്ദ്ര ജല കമ്മീഷൻ</a> · <a href=\"https://www.kseb.in\" target=\"_blank\" rel=\"noopener\">KSEB (ഡാമുകൾ)</a> · <a href=\"https://mausam.imd.gov.in\" target=\"_blank\" rel=\"noopener\">IMD (കാലാവസ്ഥ)</a>. " +
      "പുഴയുടെയും മഴയുടെയും വിവരങ്ങൾ <a href=\"https://open-meteo.com\" target=\"_blank\" rel=\"noopener\">Open-Meteo</a>-ൽ നിന്ന്. പുഴകളും ഭൂപടവും © <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\" rel=\"noopener\">OpenStreetMap</a> സംഭാവകർ.",

    /* ---------- IMD colour scale and official alerts ---------- */
    "No warning": "മുന്നറിയിപ്പില്ല",
    "Be updated": "വിവരങ്ങൾ ശ്രദ്ധിക്കുക",
    "Be prepared": "തയ്യാറായിരിക്കുക",
    "Take action": "നടപടി സ്വീകരിക്കുക",
    "Green · No warning": "Green · മുന്നറിയിപ്പില്ല",
    "Yellow · Be updated": "Yellow · വിവരങ്ങൾ ശ്രദ്ധിക്കുക",
    "Orange · Be prepared": "Orange · തയ്യാറായിരിക്കുക",
    "Red · Take action": "Red · നടപടി സ്വീകരിക്കുക",
    "The river is at its usual level for this time of year. No action needed.": "ഈ സമയത്ത് സാധാരണയുള്ള നിലയിലാണ് പുഴ. ഒന്നും ചെയ്യേണ്ടതില്ല.",
    "More water than usual. Keep following the news and official updates.": "സാധാരണയിലും കൂടുതൽ വെള്ളമുണ്ട്. വാർത്തകളും ഔദ്യോഗിക അറിയിപ്പുകളും ശ്രദ്ധിക്കുക.",
    "The water is high. Keep your emergency bag ready and know where you would go.": "വെള്ളം ഉയർന്നിരിക്കുന്നു. അടിയന്തര ബാഗ് തയ്യാറാക്കി വെക്കുക, എവിടേക്ക് മാറുമെന്ന് അറിഞ്ഞുവെക്കുക.",
    "Water may enter homes near the river. Move to safety when officials tell you to.": "പുഴയോരത്തെ വീടുകളിൽ വെള്ളം കയറിയേക്കാം. ഉദ്യോഗസ്ഥർ പറയുമ്പോൾ സുരക്ഷിത സ്ഥലത്തേക്ക് മാറുക.",
    "These are the four colours of the India Meteorological Department (IMD). Kerala's official alerts use the same colours.": "ഇന്ത്യ കാലാവസ്ഥാ വകുപ്പിന്റെ (IMD) നാല് നിറങ്ങളാണ് ഇവ. കേരളത്തിലെ ഔദ്യോഗിക മുന്നറിയിപ്പുകളിലും ഇതേ നിറങ്ങളാണ്.",
    "No action needed.": "ഒന്നും ചെയ്യേണ്ടതില്ല.",
    "Keep following the news and official updates.": "വാർത്തകളും ഔദ്യോഗിക അറിയിപ്പുകളും ശ്രദ്ധിക്കുക.",
    "Keep your emergency bag ready and know where you would go.": "അടിയന്തര ബാഗ് തയ്യാറാക്കി വെക്കുക, എവിടേക്ക് മാറുമെന്ന് അറിഞ്ഞുവെക്കുക.",
    "Follow official instructions and move to safety when told.": "ഔദ്യോഗിക നിർദ്ദേശങ്ങൾ പാലിക്കുക, പറയുമ്പോൾ സുരക്ഷിത സ്ഥലത്തേക്ക് മാറുക.",
    "A place's colour on this site is our estimate from river and rain data, unless an official alert is in force there. Official alerts always come first.":
      "ഔദ്യോഗിക മുന്നറിയിപ്പ് നിലവിലില്ലാത്തപ്പോൾ, ഈ സൈറ്റിൽ ഒരു സ്ഥലത്തിന്റെ നിറം പുഴയുടെയും മഴയുടെയും വിവരങ്ങളിൽ നിന്നുള്ള ഞങ്ങളുടെ വിലയിരുത്തലാണ്. ഔദ്യോഗിക മുന്നറിയിപ്പുകൾക്കാണ് എപ്പോഴും മുൻഗണന.",
    "Dam alerts (KSEB and Irrigation Department)": "Dam alerts (KSEB, ജലസേചന വകുപ്പ്)",
    "The dam is nearly full. Water may be let out soon. People by the river should be prepared.": "ഡാം ഏകദേശം നിറഞ്ഞു. ഉടൻ വെള്ളം തുറന്നുവിട്ടേക്കാം. പുഴയോരത്തുള്ളവർ തയ്യാറായിരിക്കണം.",
    "Where official warnings are published": "ഔദ്യോഗിക മുന്നറിയിപ്പുകൾ എവിടെ ലഭിക്കും",
    "Every official alert for Kerala from IMD and KSDMA, in English and Malayalam.": "IMD-യുടെയും KSDMA-യുടെയും കേരളത്തിനുള്ള എല്ലാ ഔദ്യോഗിക മുന്നറിയിപ്പുകളും, ഇംഗ്ലീഷിലും മലയാളത്തിലും.",
    "Kerala State Disaster Management Authority: warnings, dam levels and advice.": "കേരള സംസ്ഥാന ദുരന്തനിവാരണ അതോറിറ്റി: മുന്നറിയിപ്പുകൾ, ഡാം ജലനിരപ്പ്, നിർദ്ദേശങ്ങൾ.",
    "District-wise rain warnings for the next five days.": "അടുത്ത അഞ്ച് ദിവസത്തേക്കുള്ള ജില്ല തിരിച്ചുള്ള മഴ മുന്നറിയിപ്പുകൾ.",
    "District Collectors announce holidays, evacuations and dam releases on their district websites:": "അവധി, ഒഴിപ്പിക്കൽ, ഡാം തുറക്കൽ തുടങ്ങിയ അറിയിപ്പുകൾ ജില്ലാ കളക്ടർമാർ ജില്ലാ വെബ്സൈറ്റുകളിൽ പ്രസിദ്ധീകരിക്കുന്നു:",
    "Town or village name": "സ്ഥലപ്പേര്",
    "Our estimate from river and rain data. Not an official warning.": "പുഴയുടെയും മഴയുടെയും വിവരങ്ങളിൽ നിന്നുള്ള ഞങ്ങളുടെ വിലയിരുത്തൽ. ഔദ്യോഗിക മുന്നറിയിപ്പല്ല.",
    "Based on the official alert for {district} district.": "{district} ജില്ലയ്ക്കുള്ള ഔദ്യോഗിക മുന്നറിയിപ്പ് അനുസരിച്ച്.",
    "{source} · until {time}": "{source} · {time} വരെ",
    "Official alerts aren't kept for past dates.": "പഴയ തീയതികളിലെ ഔദ്യോഗിക മുന്നറിയിപ്പുകൾ സൂക്ഷിക്കുന്നില്ല.",
    "No official alert for {district} district right now.": "{district} ജില്ലയ്ക്ക് ഇപ്പോൾ ഔദ്യോഗിക മുന്നറിയിപ്പില്ല.",
    "No official alerts in Kerala right now": "കേരളത്തിൽ ഇപ്പോൾ ഔദ്യോഗിക മുന്നറിയിപ്പുകളില്ല",

    "Run by Tamil Nadu. No official daily figure for the water sent to Tamil Nadu": "തമിഴ്നാടിന്റെ നിയന്ത്രണത്തിൽ. തമിഴ്നാട്ടിലേക്ക് ദിവസവും എത്ര വെള്ളം കൊണ്ടുപോകുന്നു എന്നതിന് ഔദ്യോഗിക കണക്ക് ലഭ്യമല്ല",
    "Water level {level} ft, permitted up to {max} ft. Same day last year: {ly} ft.": "ജലനിരപ്പ് {level} ft, അനുവദനീയമായ പരമാവധി {max} ft. കഴിഞ്ഞ വർഷം ഇതേ ദിവസം: {ly} ft.",

    /* ---------- Status words ---------- */
    "Not sure": "വ്യക്തമല്ല",
    "We couldn't get a reading for this date. Please follow official news.": "ഈ തീയതിയിലെ വിവരം ലഭിച്ചില്ല. ഔദ്യോഗിക വാർത്തകൾ ശ്രദ്ധിക്കുക.",
    "Danger meter": "അപകടസൂചിക",

    /* ---------- What to do ---------- */
    "No action needed. Keep an eye on the news when it rains heavily.": "ഇപ്പോൾ ഒന്നും ചെയ്യേണ്ടതില്ല. കനത്ത മഴ പെയ്യുമ്പോൾ വാർത്തകൾ ശ്രദ്ധിക്കുക.",
    "It's a good time to check your emergency bag.": "അടിയന്തര ബാഗ് ഒന്ന് പരിശോധിക്കാൻ പറ്റിയ സമയമാണ്.",
    "Watch the news and listen for announcements.": "വാർത്തകളും അറിയിപ്പുകളും ശ്രദ്ധിക്കുക.",
    "Keep papers, medicines and phone charger in a waterproof bag.": "രേഖകൾ, മരുന്നുകൾ, ഫോൺ ചാർജർ എന്നിവ വെള്ളം കയറാത്ത ബാഗിൽ സൂക്ഷിക്കുക.",
    "Move valuables and vehicles to higher ground.": "വിലപിടിപ്പുള്ള സാധനങ്ങളും വാഹനങ്ങളും ഉയർന്ന സ്ഥലത്തേക്ക് മാറ്റുക.",
    "Pack your emergency bag now.": "അടിയന്തര ബാഗ് ഇപ്പോൾ തന്നെ ഒരുക്കുക.",
    "Move old people, children and animals to a safer place early.": "പ്രായമായവരെയും കുട്ടികളെയും മൃഗങ്ങളെയും നേരത്തെ സുരക്ഷിത സ്ഥലത്തേക്ക് മാറ്റുക.",
    "Find out where your nearest relief camp is.": "അടുത്തുള്ള ദുരിതാശ്വാസ ക്യാമ്പ് എവിടെയെന്ന് അറിഞ്ഞുവെക്കുക.",
    "Do not walk or drive through flowing water.": "ഒഴുകുന്ന വെള്ളത്തിലൂടെ നടക്കുകയോ വണ്ടി ഓടിക്കുകയോ ചെയ്യരുത്.",
    "Move to higher ground or a relief camp now if told to, or if water is coming in.": "നിർദ്ദേശം കിട്ടിയാലോ വെള്ളം കയറിത്തുടങ്ങിയാലോ ഉടൻ ഉയർന്ന സ്ഥലത്തേക്കോ ദുരിതാശ്വാസ ക്യാമ്പിലേക്കോ മാറുക.",
    "Switch off electricity at the main switch before leaving.": "പോകുന്നതിന് മുമ്പ് മെയിൻ സ്വിച്ച് ഓഫ് ചെയ്യുക.",
    "Call 112 for rescue. Don't wait for water to rise.": "രക്ഷാപ്രവർത്തനത്തിന് 112 വിളിക്കുക. വെള്ളം ഉയരുന്നതുവരെ കാത്തിരിക്കരുത്.",
    "Follow announcements from the District Collector.": "ജില്ലാ കളക്ടറുടെ അറിയിപ്പുകൾ പാലിക്കുക.",
    "Call 1077 to ask your district control room.": "വിവരങ്ങൾക്ക് ജില്ലാ കൺട്രോൾ റൂമിനെ 1077-ൽ വിളിക്കുക.",
    "This is how it was on {date}. For today's advice, choose Today.": "{date}-ലെ അവസ്ഥയാണിത്. ഇന്നത്തെ നിർദ്ദേശങ്ങൾക്ക് 'ഇന്ന്' തിരഞ്ഞെടുക്കുക.",

    /* ---------- Amount of water ---------- */
    "No reading": "വിവരമില്ല",
    "No reading.": "വിവരമില്ല.",
    "Less water than usual": "സാധാരണയിലും കുറവ് വെള്ളം",
    "About the usual amount of water": "ഏകദേശം സാധാരണ അളവിൽ വെള്ളം",
    "A little more water than usual": "സാധാരണയിലും അൽപം കൂടുതൽ വെള്ളം",
    "About twice the usual water": "സാധാരണയുടെ ഏകദേശം ഇരട്ടി വെള്ളം",
    "About three times the usual water": "സാധാരണയുടെ ഏകദേശം മൂന്നിരട്ടി വെള്ളം",
    "Many times more water than usual": "സാധാരണയുടെ പലമടങ്ങ് വെള്ളം",
    "<b>{amount}</b> for this time of year.": "ഈ സമയത്തെ സാധാരണ നിലയുമായി നോക്കുമ്പോൾ: <b>{amount}</b>.",
    "{amount} for this time of year.": "ഈ സമയത്തെ അപേക്ഷിച്ച്: {amount}.",
    "▲ Rising since the day before": "▲ തലേദിവസത്തേക്കാൾ ഉയരുന്നു",
    "▼ Going down since the day before": "▼ തലേദിവസത്തേക്കാൾ താഴുന്നു",
    "▬ About the same as the day before": "▬ തലേദിവസത്തെ പോലെ തന്നെ",
    "Usual amount of water compared with today": "സാധാരണ അളവും ഇന്നത്തെ അളവും",

    /* ---------- Rain ---------- */
    "Rain data isn't available right now.": "മഴയുടെ വിവരം ഇപ്പോൾ ലഭ്യമല്ല.",
    "No rain data": "മഴയുടെ വിവരമില്ല",
    "no data": "വിവരമില്ല",
    "Very heavy rain fell": "അതിശക്തമായ മഴ പെയ്തു",
    "Very heavy rain today": "ഇന്ന് അതിശക്തമായ മഴ",
    "Very heavy rain expected": "അതിശക്തമായ മഴയ്ക്ക് സാധ്യത",
    "Heavy rain fell": "ശക്തമായ മഴ പെയ്തു",
    "Heavy rain today": "ഇന്ന് ശക്തമായ മഴ",
    "Heavy rain expected": "ശക്തമായ മഴയ്ക്ക് സാധ്യത",
    "Steady rain fell": "തുടർച്ചയായ മഴ പെയ്തു",
    "Steady rain today": "ഇന്ന് തുടർച്ചയായ മഴ",
    "Steady rain expected": "തുടർച്ചയായ മഴയ്ക്ക് സാധ്യത",
    "Light showers fell": "ചെറിയ ചാറ്റൽമഴ പെയ്തു",
    "Light showers today": "ഇന്ന് ചെറിയ ചാറ്റൽമഴ",
    "Light showers expected": "ചാറ്റൽമഴയ്ക്ക് സാധ്യത",
    "Little or no rain": "മഴ കുറവ് അല്ലെങ്കിൽ ഇല്ല",
    "Little or no rain expected": "മഴയ്ക്ക് സാധ്യത കുറവ്",
    "Daily rain over the past month and next week": "കഴിഞ്ഞ മാസത്തെയും അടുത്ത ആഴ്ചയിലെയും ദിവസേനയുള്ള മഴ",

    /* ---------- Land ---------- */
    "Your land: about {m} m above the sea.": "നിങ്ങളുടെ സ്ഥലം: കടൽനിരപ്പിൽ നിന്ന് ഏകദേശം {m} m ഉയരത്തിൽ.",
    "Very low land, almost at sea level. Water gathers here first and drains slowly.": "വളരെ താഴ്ന്ന പ്രദേശം, ഏകദേശം കടൽനിരപ്പിൽ. വെള്ളം ആദ്യം ഇവിടെ കെട്ടിനിൽക്കും, പതുക്കെയേ ഇറങ്ങൂ.",
    "Low-lying land near the river. It can flood when the river rises.": "പുഴയ്ക്കടുത്തുള്ള താഴ്ന്ന പ്രദേശം. പുഴ ഉയരുമ്പോൾ വെള്ളം കയറാം.",
    "Slightly raised land, but nearby streams can still overflow.": "അൽപം ഉയർന്ന പ്രദേശം, എങ്കിലും അടുത്തുള്ള തോടുകൾ കവിഞ്ഞൊഴുകാം.",
    "Higher ground. River floods are less likely to reach here.": "ഉയർന്ന പ്രദേശം. പുഴയിലെ വെള്ളപ്പൊക്കം ഇവിടെ എത്താൻ സാധ്യത കുറവ്.",

    /* ---------- Dams ---------- */
    "{kind} in {district} district.": "{district} ജില്ലയിലെ {kind}.",
    "Full": "നിറഞ്ഞു",
    "Almost full": "ഏകദേശം നിറഞ്ഞു",
    "More than half full": "പകുതിയിലേറെ നിറഞ്ഞു",
    "About half full": "ഏകദേശം പകുതി",
    "Low": "കുറവ്",
    "Full and spilling over the top": "നിറഞ്ഞ് മുകളിലൂടെ കവിഞ്ഞൊഴുകുന്നു",
    "Gates open: sending flood water to the sea": "ഷട്ടറുകൾ തുറന്നു: വെള്ളം കടലിലേക്ക് ഒഴുക്കുന്നു",
    "Gates closed": "ഷട്ടറുകൾ അടച്ചിരിക്കുന്നു",
    "Gates open: water flows freely to the sea": "ഷട്ടറുകൾ തുറന്നു: വെള്ളം കടലിലേക്ക് സ്വതന്ത്രമായി ഒഴുകുന്നു",
    "Gates open: the river flows straight through": "ഷട്ടറുകൾ തുറന്നു: പുഴ നേരെ ഒഴുകുന്നു",
    "Gates closed: holding water, not letting any out": "ഷട്ടറുകൾ അടച്ചിരിക്കുന്നു: വെള്ളം പുറത്തുവിടുന്നില്ല",
    "Letting out a small amount of water": "കുറച്ച് വെള്ളം തുറന്നുവിടുന്നു",
    "Letting out a fair amount of water": "മിതമായ അളവിൽ വെള്ളം തുറന്നുവിടുന്നു",
    "Letting out a lot of water": "ധാരാളം വെള്ളം തുറന്നുവിടുന്നു",
    "Not in today's official dam table": "ഇന്നത്തെ ഔദ്യോഗിക ഡാം പട്ടികയിൽ ഇല്ല",
    "Not in Kerala's daily dam table (run by Tamil Nadu)": "കേരളത്തിന്റെ ദിവസേനയുള്ള ഡാം പട്ടികയിൽ ഇല്ല (തമിഴ്നാടിന്റെ നിയന്ത്രണത്തിൽ)",
    "No saved reading for this date": "ഈ തീയതിയിലെ വിവരം സൂക്ഷിച്ചിട്ടില്ല",
    "Not in that day's official table": "അന്നത്തെ ഔദ്യോഗിക പട്ടികയിൽ ഇല്ല",
    "Old dam high in the hills, run by Tamil Nadu.": "മലമുകളിലെ പഴയ ഡാം, തമിഴ്നാടിന്റെ നിയന്ത്രണത്തിൽ.",
    "Kerala's biggest dam.": "കേരളത്തിലെ ഏറ്റവും വലിയ ഡാം.",
    "A small dam below Idukki.": "ഇടുക്കിക്ക് താഴെയുള്ള ചെറിയ ഡാം.",
    "Big dam on a side river that joins the Periyar.": "പെരിയാറിൽ ചേരുന്ന കൈവഴിയിലെ വലിയ ഡാം.",
    "Low gates across the Periyar.": "പെരിയാറിന് കുറുകെയുള്ള താഴ്ന്ന ഷട്ടറുകൾ.",
    "Dam near where the Pamba begins.": "പമ്പ തുടങ്ങുന്നിടത്തിനടുത്തുള്ള ഡാം.",
    "Big dam on the Kakki river.": "കക്കി പുഴയിലെ വലിയ ഡാം.",
    "Small dam below the Sabarigiri power station.": "ശബരിഗിരി പവർ സ്റ്റേഷന് താഴെയുള്ള ചെറിയ ഡാം.",
    "Low gates on the Kakkad river.": "കക്കാട്ടാറിലെ താഴ്ന്ന ഷട്ടറുകൾ.",
    "Gates that send Kuttanad's flood water to the sea.": "കുട്ടനാട്ടിലെ വെള്ളം കടലിലേക്ക് ഒഴുക്കുന്ന ഷട്ടറുകൾ.",
    "Gates in Vembanad Lake.": "വേമ്പനാട് കായലിലെ ഷട്ടറുകൾ.",

    /* ---------- Dates and timestamps ---------- */
    "Latest official reading (dams are not forecast)": "ഏറ്റവും പുതിയ ഔദ്യോഗിക വിവരം (ഡാമുകൾക്ക് പ്രവചനമില്ല)",
    "No official dam reading was saved for this date": "ഈ തീയതിയിലെ ഔദ്യോഗിക ഡാം വിവരം സൂക്ഷിച്ചിട്ടില്ല",
    "Nearest saved reading: {date}": "അടുത്തുള്ള സൂക്ഷിച്ച വിവരം: {date}",
    "No dam data": "ഡാം വിവരമില്ല",

    /* ---------- The numbers (eye button) ---------- */

    /* ---------- Dashboard ---------- */
    "Open your place, and the dams and towns up and down the river, in the free offline Organic Maps app":
      "നിങ്ങളുടെ സ്ഥലവും പുഴയുടെ മുകളിലും താഴെയുമുള്ള ഡാമുകളും പട്ടണങ്ങളും സൗജന്യ ഓഫ്‌ലൈൻ Organic Maps ആപ്പിൽ തുറക്കുക",
    "River data isn't available right now. Please try Refresh in a moment.": "പുഴയുടെ വിവരം ഇപ്പോൾ ലഭ്യമല്ല. അൽപസമയം കഴിഞ്ഞ് 'പുതുക്കുക' അമർത്തുക.",
    "About {km} km from the nearest river we follow ({river})": "ഞങ്ങൾ നിരീക്ഷിക്കുന്ന ഏറ്റവും അടുത്ത പുഴയിൽ ({river}) നിന്ന് ഏകദേശം {km} km",
    "On the {river} river": "{river} പുഴയുടെ തീരത്ത്",
    "Near the {river} river": "{river} പുഴയ്ക്ക് സമീപം",
    " · about {km} km from the sea": " · കടലിൽ നിന്ന് ഏകദേശം {km} km",
    "Measured on the {river} near <b>{town}</b>.": "{river} പുഴയിൽ <b>{town}</b>-ന് സമീപം അളന്നത്.",
    "Measured on the {river} near <b>{town}</b>, about {km} km upstream of you along the river.":
      "{river} പുഴയിൽ <b>{town}</b>-ന് സമീപം അളന്നത്, പുഴ വഴി നിങ്ങളിൽ നിന്ന് ഏകദേശം {km} km മുകളിൽ.",
    "Measured on the {river} near <b>{town}</b>, about {km} km downstream of you along the river.":
      "{river} പുഴയിൽ <b>{town}</b>-ന് സമീപം അളന്നത്, പുഴ വഴി നിങ്ങളിൽ നിന്ന് ഏകദേശം {km} km താഴെ.",
    "{n} km away": "{n} km അകലെ",
    "close by": "തൊട്ടടുത്ത്",
    "{n} km upstream": "{n} km മുകളിൽ",
    "{n} km downstream": "{n} km താഴെ",
    "Nothing upstream is measured: you are near where the {river} begins.": "മുകൾഭാഗത്ത് അളവെടുപ്പില്ല: {river} പുഴ തുടങ്ങുന്നിടത്തിനടുത്താണ് നിങ്ങൾ.",
    "No dam or measuring point upstream on the {river}. It is a small river; heavy rain nearby matters most here.":
      "{river} പുഴയുടെ മുകൾഭാഗത്ത് ഡാമോ അളക്കുന്ന സ്ഥലമോ ഇല്ല. ഇതൊരു ചെറിയ പുഴയാണ്; അടുത്ത് പെയ്യുന്ന കനത്ത മഴയാണ് ഇവിടെ പ്രധാനം.",
    "Their river isn't on our map, so we can't say whether their water reaches you.":
      "ഇവയുടെ പുഴ ഞങ്ങളുടെ ഭൂപടത്തിലില്ല, അതിനാൽ ഇവയിലെ വെള്ളം നിങ്ങളുടെ അടുത്തെത്തുമോ എന്ന് പറയാനാവില്ല.",
    "Our map follows the river about {km} km further. Beyond that it leaves Kerala, or OpenStreetMap doesn't name its lower course.":
      "ഞങ്ങളുടെ ഭൂപടം പുഴയെ ഏകദേശം {km} km കൂടി പിന്തുടരുന്നു. അതിനപ്പുറം പുഴ കേരളം വിടുന്നു, അല്ലെങ്കിൽ OpenStreetMap-ൽ അതിന്റെ താഴ്ഭാഗത്തിന് പേരില്ല.",
    "This is where our map of the river ends: it leaves Kerala here, or OpenStreetMap doesn't name its lower course.":
      "ഞങ്ങളുടെ ഭൂപടത്തിൽ പുഴ ഇവിടെ അവസാനിക്കുന്നു: ഇവിടെ അത് കേരളം വിടുന്നു, അല്ലെങ്കിൽ OpenStreetMap-ൽ താഴ്ഭാഗത്തിന് പേരില്ല.",
    "The water reaches {dest} about {km} km downstream.": "ഏകദേശം {km} km താഴെ വെള്ളം {dest} എത്തുന്നു.",
    "Vembanad Lake and then the sea": "വേമ്പനാട് കായലിലും പിന്നീട് കടലിലും",
    "the sea near Kochi": "കൊച്ചിക്കടുത്ത് കടലിൽ",
    "the sea or the backwaters": "കടലിലോ കായലിലോ",
    "River water near you over the past 30 days and the next 7 days. Tap a day to choose it.":
      "കഴിഞ്ഞ 30 ദിവസത്തെയും അടുത്ത 7 ദിവസത്തെയും പുഴയിലെ വെള്ളം. ഒരു ദിവസം തിരഞ്ഞെടുക്കാൻ അതിൽ തൊടുക.",
    "The grey band is the usual amount for the time of year. Solid line: recorded. Dashed: forecast. Tap a day to see it.":
      "ചാരനിറത്തിലുള്ള ഭാഗം ഈ സമയത്തെ സാധാരണ അളവാണ്. തുടർച്ചയായ വര: രേഖപ്പെടുത്തിയത്. ഇടവിട്ട വര: പ്രവചനം. ഒരു ദിവസം കാണാൻ അതിൽ തൊടുക.",
    "{river} near {town}": "{town}-ന് സമീപം {river}",
    "Dam levels come from the official KSEB and Irrigation tables published by {ksdma}; past dates show the table saved that day. River water is from a computer model (Open-Meteo / GloFAS): recorded for past days, forecast for the next 7. Official river gauge readings aren't connected yet.":
      "ഡാമുകളിലെ ജലനിരപ്പ് {ksdma} പ്രസിദ്ധീകരിക്കുന്ന KSEB, ജലസേചന വകുപ്പ് ഔദ്യോഗിക പട്ടികകളിൽ നിന്നാണ്; പഴയ തീയതികളിൽ അന്ന് സൂക്ഷിച്ച പട്ടിക കാണിക്കുന്നു. പുഴയിലെ വെള്ളം ഒരു കമ്പ്യൂട്ടർ മോഡലിൽ നിന്നാണ് (Open-Meteo / GloFAS): കഴിഞ്ഞ ദിവസങ്ങളിലേത് രേഖപ്പെടുത്തിയതും അടുത്ത 7 ദിവസത്തേത് പ്രവചനവുമാണ്. ഔദ്യോഗിക പുഴ ഗേജ് വിവരങ്ങൾ ഇതുവരെ ബന്ധിപ്പിച്ചിട്ടില്ല.",

    /* ---------- Search ---------- */
    "We couldn't find “{text}”. Try the name of a nearby town.": "“{text}” കണ്ടെത്താനായില്ല. അടുത്തുള്ള ഒരു പട്ടണത്തിന്റെ പേര് നോക്കുക.",
    "Something went wrong. Please check your internet and try again.": "എന്തോ പിശക് സംഭവിച്ചു. ഇന്റർനെറ്റ് കണക്ഷൻ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക.",
    "Your phone or browser can't share location. Please type your town name.": "നിങ്ങളുടെ ഫോണിനോ ബ്രൗസറിനോ സ്ഥലം പങ്കിടാനാവില്ല. പട്ടണത്തിന്റെ പേര് ടൈപ്പ് ചെയ്യുക.",
    "We couldn't get your location. Please type your town name instead.": "നിങ്ങളുടെ സ്ഥലം കണ്ടെത്താനായില്ല. പകരം പട്ടണത്തിന്റെ പേര് ടൈപ്പ് ചെയ്യുക.",
    "Your location": "നിങ്ങളുടെ സ്ഥലം",

    /* ---------- Map ---------- */
    "Water · thicker river = more water": "വെള്ളം · കട്ടിയുള്ള വര = കൂടുതൽ വെള്ളം",
    " · no official reading": " · ഔദ്യോഗിക വിവരമില്ല",
    "Vembanad Lake": "വേമ്പനാട് കായൽ",
    "Ashtamudi Lake": "അഷ്ടമുടി കായൽ",
    "Arabian Sea": "അറബിക്കടൽ",
    "The map couldn't load. Please check your internet connection.": "ഭൂപടം ലോഡ് ചെയ്യാനായില്ല. ഇന്റർനെറ്റ് കണക്ഷൻ പരിശോധിക്കുക."
  };

  const KEY = "kfw:lang";
  let lang = "en";
  try { lang = localStorage.getItem(KEY) || ""; } catch (e) { /* storage unavailable */ }
  if (lang !== "en" && lang !== "ml") lang = /^ml\b/i.test(navigator.language || "") ? "ml" : "en";
  const missing = new Set();
  const listeners = [];

  /** Translate an English sentence; {name} parts are filled from vars. */
  function t(en, vars) {
    let s = en;
    if (lang === "ml") {
      if (ML[en] != null) s = ML[en]; else missing.add(en);
    }
    return vars ? s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m) : s;
  }

  // Static text in the page. The English is read from the page once, then swapped in place.
  const original = new WeakMap();
  const tidy = s => s.replace(/\s+/g, " ").trim();
  function applyStatic(root) {
    (root || document).querySelectorAll("[data-i18n]").forEach(el => {
      if (!original.has(el)) original.set(el, { html: el.innerHTML, attrs: {} });
      const o = original.get(el), key = el.dataset.i18n || tidy(el.textContent);
      el.innerHTML = lang === "ml" && ML[key] != null ? ML[key] : o.html;
      if (lang === "ml" && ML[key] == null) missing.add(key);
    });
    (root || document).querySelectorAll("[data-i18n-attr]").forEach(el => {
      if (!original.has(el)) original.set(el, { attrs: {} });
      const o = original.get(el);
      el.dataset.i18nAttr.split(",").forEach(a => {
        if (!(a in o.attrs)) o.attrs[a] = el.getAttribute(a);
        el.setAttribute(a, t(o.attrs[a]));
      });
    });
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-lang]").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === lang));
  }

  function setLang(next) {
    if (next === lang || (next !== "en" && next !== "ml")) return;
    lang = next;
    try { localStorage.setItem(KEY, lang); } catch (e) { /* storage unavailable */ }
    applyStatic();
    listeners.forEach(fn => fn(lang));
  }

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-lang]");
    if (b) setLang(b.dataset.lang);
  });

  // Malayalam place and river names from OpenStreetMap (data/places.js, data/rivers.js), shown
  // in Malayalam mode where known; otherwise the English name.
  let placeMl = null;
  function place(name) {
    if (lang !== "ml" || !name) return name;
    if (!placeMl) {
      placeMl = {};
      Object.values(window.DISTRICTS || {}).forEach(d => { placeMl[d.name.toLowerCase()] = d.ml; });
      (window.KERALA_PLACES || []).forEach(p => { if (p[4] && !placeMl[p[0].toLowerCase()]) placeMl[p[0].toLowerCase()] = p[4]; });
    }
    return placeMl[String(name).toLowerCase()] || name;
  }
  function river(key) {
    const r = (window.RIVER_LINES || {})[key];
    return lang === "ml" && r && r.ml ? r.ml : (window.RiverNet ? window.RiverNet.NAMES[key] : r && r.name);
  }

  window.I18N = {
    t, setLang, applyStatic, missing, place, river,
    get lang() { return lang; },
    get locale() { return "en-IN"; }, // dates, times and numbers stay in English
    onChange: fn => listeners.push(fn)
  };
})();
