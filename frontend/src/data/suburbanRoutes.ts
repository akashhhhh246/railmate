export interface SuburbanLine {
  id: string;
  name: string;
  description: string;
  stations: string[];
}

export interface SuburbanCity {
  id: string;
  name: string;
  networkName: string;
  lines: SuburbanLine[];
}

export const SUBURBAN_CITIES: SuburbanCity[] = [
  {
    id: 'chennai',
    name: 'Chennai',
    networkName: 'Chennai Suburban Railway (Southern Railway)',
    lines: [
      {
        id: 'chennai-south',
        name: 'South Line (Beach ↔ Tambaram ↔ Chengalpattu)',
        description: 'Busiest suburban corridor serving Central Chennai down to Chengalpattu',
        stations: [
          'Chennai Beach (MSB)',
          'Chennai Fort (MSF)',
          'Chennai Park (MPK)',
          'Chennai Egmore (MS)',
          'Chetpet (MSC)',
          'Nungambakkam (NBK)',
          'Kodambakkam (MKK)',
          'Mambalam (MBM)',
          'Saidapet (SP)',
          'Guindy (GDY)',
          'St. Thomas Mount (STM)',
          'Pazhavanthangal (PZA)',
          'Meenambakkam (MN)',
          'Tirusulam Airport (TLM)',
          'Pallavaram (PV)',
          'Chromepet (CMP)',
          'Tambaram Sanatorium (TBMS)',
          'Tambaram (TBM)',
          'Perungalathur (PRGL)',
          'Vandalur (VDR)',
          'Urapakkam (UPM)',
          'Guduvancheri (GI)',
          'Potheri (POTI)',
          'Kattangulathur (CTM)',
          'Maraimalai Nagar (MMNK)',
          'Singaperumal Koil (SKL)',
          'Paranur (PWU)',
          'Chengalpattu Jn (CGL)'
        ]
      },
      {
        id: 'chennai-west',
        name: 'West Line (Central / Moore Market ↔ Avadi ↔ Tiruvallur ↔ Arakkonam)',
        description: 'Western industrial & residential commuter corridor',
        stations: [
          'MGR Chennai Central (MAS)',
          'Basin Bridge Jn (BBQ)',
          'Vyasarpadi Jeeva (VPY)',
          'Perambur (PER)',
          'Perambur Carriage Works (PCW)',
          'Perambur Loco Works (PEW)',
          'Villivakkam (VLK)',
          'Korattur (KOTR)',
          'Pattaravakkam (PVM)',
          'Ambattur (ABU)',
          'Tirumullaivoyal (TMVL)',
          'Annanur (ANNR)',
          'Avadi (AVD)',
          'Hindu College (HC)',
          'Pattabiram (PAB)',
          'Nemilichery (NEC)',
          'Thiruninravur (TI)',
          'Veppampattu (VEU)',
          'Sevvapet Road (SVR)',
          'Putlur (PTLR)',
          'Tiruvallur (TRL)',
          'Egattur (EGT)',
          'Kadambattur (KBT)',
          'Senji Panambakkam (SPAM)',
          'Manavur (MAF)',
          'Thiruvalangadu (TO)',
          'Mosur (MSU)',
          'Puliyamangalam (PLMG)',
          'Arakkonam Jn (AJJ)'
        ]
      },
      {
        id: 'chennai-north',
        name: 'North Line (Central ↔ Ennore ↔ Gummidipoondi ↔ Sullurpeta)',
        description: 'Northern port and industrial commuter corridor',
        stations: [
          'MGR Chennai Central (MAS)',
          'Basin Bridge Jn (BBQ)',
          'Korukkupet (KOK)',
          'Tondiarpet (TNP)',
          'V.O.C. Nagar (VOC)',
          'Tiruvottiyur (TVT)',
          'Wimco Nagar (WCN)',
          'Kathivakkam (KAV)',
          'Ennore (ENR)',
          'Athipattu Pudunagar (AIPP)',
          'Athipattu (AIP)',
          'Nandiambakkam (NPKM)',
          'Minjur (MJR)',
          'Anuppambattu (APB)',
          'Ponneri (PON)',
          'Kavaraippettai (KVP)',
          'Gummidipoondi (GPD)',
          'Elavur (ELR)',
          'Arambakkam (AKM)',
          'Tada (TADA)',
          'Sullurpeta (SPE)'
        ]
      },
      {
        id: 'chennai-mrts',
        name: 'MRTS Line (Chennai Beach ↔ Mylapore ↔ Velachery)',
        description: 'Elevated mass transit corridor across Eastern Chennai',
        stations: [
          'Chennai Beach (MSB)',
          'Chennai Fort (MSF)',
          'Chennai Park Town (MPKT)',
          'Chintadripet (MCPT)',
          'Chepauk (MCPK)',
          'Thiruvallikeni (MTCN)',
          'Light House (MLHS)',
          'Mundakakanni Amman Koil (MKAK)',
          'Thirumayilai (MTMY)',
          'Mandaveli (MNDY)',
          'Greenways Road (GWYR)',
          'Kotturpuram (KTPM)',
          'Kasturba Nagar (KTBR)',
          'Indira Nagar (INDR)',
          'Tiruvanmiyur (TYMR)',
          'Taramani (TRMN)',
          'Perungudi (PRGD)',
          'Velachery (VLCY)'
        ]
      }
    ]
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    networkName: 'Mumbai Suburban Railway (Western & Central Railway)',
    lines: [
      {
        id: 'mumbai-western',
        name: 'Western Line (Churchgate ↔ Andheri ↔ Borivali ↔ Virar ↔ Dahanu Road)',
        description: 'Mumbai lifeline connecting South Mumbai with Western Suburbs',
        stations: [
          'Churchgate (CCG)',
          'Marine Lines (MEL)',
          'Charni Road (CYR)',
          'Grant Road (GTR)',
          'Mumbai Central (MMCT)',
          'Mahalaxmi (MX)',
          'Lower Parel (PL)',
          'Prabhadevi (PBHD)',
          'Dadar Western (DDR)',
          'Matunga Road (MRU)',
          'Mahim Jn (MM)',
          'Bandra (BA)',
          'Khar Road (KHAR)',
          'Santacruz (STC)',
          'Vile Parle (VLP)',
          'Andheri (ADH)',
          'Jogeshwari (JOS)',
          'Ram Mandir (RMAR)',
          'Goregaon (GMN)',
          'Malad (MDD)',
          'Kandivali (KNDI)',
          'Borivali (BVI)',
          'Dahisar (DIC)',
          'Mira Road (MIRA)',
          'Bhayandar (BYR)',
          'Naigaon (NIG)',
          'Vasai Road (BSR)',
          'Nallasopara (NSP)',
          'Virar (VR)',
          'Vaitarna (VTN)',
          'Saphale (SAH)',
          'Kelve Road (KLV)',
          'Palghar (PLG)',
          'Boisar (BOR)',
          'Dahanu Road (DRD)'
        ]
      },
      {
        id: 'mumbai-central-main',
        name: 'Central Main Line (CSMT ↔ Dadar ↔ Thane ↔ Kalyan ↔ Kasara / Khopoli)',
        description: 'Central Mumbai suburban backbone to Thane, Kalyan & beyond',
        stations: [
          'CSMT (CSMT)',
          'Masjid (MSD)',
          'Sandhurst Road (SNRD)',
          'Byculla (BY)',
          'Chinchpokli (CHG)',
          'Currey Road (CRD)',
          'Parel (PR)',
          'Dadar Central (DR)',
          'Matunga Central (MTN)',
          'Sion (SIN)',
          'Kurla Jn (CLA)',
          'Vidyavihar (VVH)',
          'Ghatkopar (GC)',
          'Vikhroli (VK)',
          'Kanjurmarg (KJMG)',
          'Bhandup (BND)',
          'Nahur (NHU)',
          'Mulund (MLND)',
          'Thane (TNA)',
          'Kalva (KLVA)',
          'Mumbra (MBQ)',
          'Diva Jn (DIVA)',
          'Kopar (KOPR)',
          'Dombivli (DI)',
          'Thakurli (THK)',
          'Kalyan Jn (KYN)',
          'Shahad (SHAD)',
          'Ambivli (ABY)',
          'Titwala (TLA)',
          'Khadavli (KDV)',
          'Vasind (VSD)',
          'Asangaon (ASO)',
          'Kasara (KSRA)',
          'Vitthalwadi (VLDI)',
          'Ulhasnagar (ULNR)',
          'Ambernath (ABH)',
          'Badlapur (BUD)',
          'Vangani (VGI)',
          'Neral Jn (NRL)',
          'Karjat (KJT)',
          'Khopoli (KHPI)'
        ]
      },
      {
        id: 'mumbai-harbour',
        name: 'Harbour Line (CSMT ↔ Kurla ↔ Vashi ↔ Panvel)',
        description: 'Connecting CSMT and Kurla to Navi Mumbai and Panvel',
        stations: [
          'CSMT (CSMT)',
          'Masjid (MSD)',
          'Sandhurst Road (SNRD)',
          'Dockyard Road (DKRD)',
          'Reay Road (RRD)',
          'Cotton Green (CTGN)',
          'Sewri (SVE)',
          'Vadala Road (VDLR)',
          'GTB Nagar (GTBN)',
          'Chunabhatti (CHF)',
          'Kurla (CLA)',
          'Tilak Nagar (TKNG)',
          'Chembur (CMBR)',
          'Govandi (GV)',
          'Mankhurd (MNKD)',
          'Vashi (VSH)',
          'Sanpada (SNCR)',
          'Juinagar (JNJ)',
          'Nerul (NEU)',
          'Seawoods-Darave (SWDV)',
          'CBD Belapur (BEPR)',
          'Kharghar (KHAG)',
          'Mansarovar (MANR)',
          'Khandeshwar (KNDS)',
          'Panvel Jn (PNVL)'
        ]
      },
      {
        id: 'mumbai-trans-harbour',
        name: 'Trans-Harbour Line (Thane ↔ Kopar Khairane ↔ Vashi / Panvel)',
        description: 'Direct suburban transit between Thane and Navi Mumbai',
        stations: [
          'Thane (TNA)',
          'Digha Gaon (DIGH)',
          'Airoli (AIRL)',
          'Rabale (RABE)',
          'Ghansoli (GNSL)',
          'Kopar Khairane (KPHN)',
          'Turbhe (TUH)',
          'Sanpada (SNCR)',
          'Vashi (VSH)',
          'Juinagar (JNJ)',
          'Nerul (NEU)',
          'Panvel Jn (PNVL)'
        ]
      }
    ]
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    networkName: 'Kolkata Suburban Railway (Eastern & South Eastern Railway)',
    lines: [
      {
        id: 'kolkata-howrah-main',
        name: 'Howrah Main Line (Howrah ↔ Serampore ↔ Bandel ↔ Barddhaman)',
        description: 'Historic railway trunk running along the Hooghly river',
        stations: [
          'Howrah Jn (HWH)',
          'Liluah (LLH)',
          'Belur (BEQ)',
          'Bally (BLY)',
          'Uttarpara (UPA)',
          'Hind Motor (HM)',
          'Konnagar (KOG)',
          'Rishra (RIS)',
          'Serampore (SRP)',
          'Sheoraphuli Jn (SHE)',
          'Baidyabati (BBA)',
          'Bhadreswar (BHR)',
          'Mankundu (MUU)',
          'Chandannagar (CGR)',
          'Chuchura (CNS)',
          'Hooghly (HGY)',
          'Bandel Jn (BDC)',
          'Barddhaman Jn (BWN)'
        ]
      },
      {
        id: 'kolkata-sealdah-north',
        name: 'Sealdah North Line (Sealdah ↔ Dum Dum ↔ Barrackpore ↔ Naihati ↔ Ranaghat)',
        description: 'High-density commuter trunk linking North 24 Parganas to Sealdah',
        stations: [
          'Sealdah (SDAH)',
          'Bidhannagar Road (BNXR)',
          'Dum Dum Jn (DDJ)',
          'Belgharia (BLH)',
          'Agarpara (AGP)',
          'Sodepur (SEP)',
          'Khardaha (KDH)',
          'Titagarh (TGH)',
          'Barrackpore (BP)',
          'Palta (PTF)',
          'Ichhapur (IP)',
          'Shyamnagar (SNR)',
          'Kankinara (KNR)',
          'Naihati Jn (NH)',
          'Kanchrapara (KPA)',
          'Kalyani (KYI)',
          'Chakdaha (CDH)',
          'Ranaghat Jn (RHA)'
        ]
      },
      {
        id: 'kolkata-sealdah-south',
        name: 'Sealdah South Line (Sealdah ↔ Ballygunge ↔ Sonarpur ↔ Baruipur ↔ Diamond Harbour / Canning)',
        description: 'Southern suburban network serving South 24 Parganas and Sundarbans gateway',
        stations: [
          'Sealdah (SDAH)',
          'Park Circus (PQS)',
          'Ballygunge Jn (BLN)',
          'Dhakuria (DHK)',
          'Jadavpur (JDP)',
          'Baghajatin (BGJT)',
          'Garia (GIA)',
          'Narendrapur (NRPR)',
          'Sonarpur Jn (SPR)',
          'Subhasgram (SBGR)',
          'Mallikpur (MAK)',
          'Baruipur Jn (BRP)',
          'Diamond Harbour (DH)',
          'Canning (CG)'
        ]
      }
    ]
  },
  {
    id: 'delhi-ncr',
    name: 'Delhi NCR',
    networkName: 'Delhi Suburban & Commuter Railway (Northern Railway)',
    lines: [
      {
        id: 'delhi-faridabad-palwal',
        name: 'South Commuter (Delhi ↔ Faridabad ↔ Ballabhgarh ↔ Palwal)',
        description: 'Industrial commuter line connecting Delhi to Haryana NCR hubs',
        stations: [
          'New Delhi (NDLS)',
          'Shivaji Bridge (CSB)',
          'Tilak Bridge (TKJ)',
          'Hazrat Nizamuddin (NZM)',
          'Okhla (OKA)',
          'Tuglakabad (TKD)',
          'Faridabad (FDB)',
          'New Faridabad (FDN)',
          'Ballabhgarh (BVH)',
          'Asaoti (AST)',
          'Palwal (PWL)'
        ]
      },
      {
        id: 'delhi-ghaziabad-meerut',
        name: 'East Commuter (Delhi ↔ Sahibabad ↔ Ghaziabad ↔ Modinagar ↔ Meerut)',
        description: 'Busy Eastern NCR commuter rail corridor into Western UP',
        stations: [
          'New Delhi (NDLS)',
          'Anand Vihar Terminal (ANVT)',
          'Sahibabad Jn (SBB)',
          'Ghaziabad Jn (GZB)',
          'New Ghaziabad (GZN)',
          'Guldhar (GUH)',
          'Duhai (DXH)',
          'Muradnagar (MDNR)',
          'Modinagar (MDNR)',
          'Mohiuddinpur (MUZ)',
          'Meerut City (MTC)'
        ]
      },
      {
        id: 'delhi-gurgaon-rewari',
        name: 'South-West Commuter (Delhi ↔ Delhi Cantt ↔ Gurgaon ↔ Rewari)',
        description: 'Connecting Delhi Cantt, Palam, Gurugram IT hub & Rewari junction',
        stations: [
          'Old Delhi Jn (DLI)',
          'Delhi Sarai Rohilla (DEE)',
          'Delhi Cantt (DEC)',
          'Palam (PM)',
          'Shahabad Mohammadpur (SMDP)',
          'Bijwasan (BWSN)',
          'Gurgaon (GGN)',
          'Basai Dhankot (BDXT)',
          'Garhi Harsaru (GHH)',
          'Pataudi Road (PTRD)',
          'Rewari Jn (RE)'
        ]
      }
    ]
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad (MMTS)',
    networkName: 'Multi-Modal Transport System (South Central Railway)',
    lines: [
      {
        id: 'mmts-line-1',
        name: 'Line 1 (Hyderabad Nampally ↔ Begumpet ↔ Hitec City ↔ Lingampalli)',
        description: 'Main commuter link to HITEC City tech corridor',
        stations: [
          'Hyderabad Deccan Nampally (HYB)',
          'Lakdikapul (LKPL)',
          'Khairatabad (KHTD)',
          'Necklace Road (NLRD)',
          'Begumpet (BMT)',
          'Nature Cure Hospital (NCHS)',
          'Fateh Nagar (FNB)',
          'Bharat Nagar (BTNR)',
          'Borabanda (BRBD)',
          'Hitec City (HTCY)',
          'Hafizpet (HFZ)',
          'Chanda Nagar (CDNR)',
          'Lingampalli (LPI)'
        ]
      },
      {
        id: 'mmts-line-2',
        name: 'Line 2 (Falaknuma ↔ Kacheguda ↔ Secunderabad ↔ Lingampalli)',
        description: 'Cross-city corridor from Old City to IT Cyberabad',
        stations: [
          'Falaknuma (FM)',
          'Huppuguda (HPG)',
          'Yakutpura (YKA)',
          'Dabirpura (DQB)',
          'Malakpet (MXT)',
          'Kacheguda (KCG)',
          'Vidyanagar (VAR)',
          'Jamai Osmania (JOO)',
          'Arts College (ATC)',
          'Sitafalmandi (STPD)',
          'Secunderabad Jn (SC)',
          'James Street (JET)',
          'Sanjeevaiah Park (SJVP)',
          'Begumpet (BMT)',
          'Hitec City (HTCY)',
          'Lingampalli (LPI)'
        ]
      },
      {
        id: 'mmts-line-3',
        name: 'Line 3 (Secunderabad ↔ Malkajgiri ↔ Bolarum ↔ Medchal)',
        description: 'Northern suburban corridor through Cantonment & Medchal',
        stations: [
          'Secunderabad Jn (SC)',
          'Malkajgiri (MJF)',
          'Dayanand Nagar (DYE)',
          'Safilguda (SFX)',
          'Ramakistapuram Gate (RKO)',
          'Ammuguda (AMQ)',
          'Cavalry Barracks (CVB)',
          'Alwal (ALW)',
          'Bolarum (BMO)',
          'Gundla Pochampally (GDPL)',
          'Medchal (MED)'
        ]
      }
    ]
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru (Commuter / MEMU)',
    networkName: 'Bengaluru Suburban / MEMU Network (South Western Railway)',
    lines: [
      {
        id: 'bengaluru-whitefield',
        name: 'Line 1 (KSR Bengaluru Majestic / Cantt ↔ KR Puram ↔ Whitefield ↔ Bangarapet)',
        description: 'Eastern tech hub corridor to ITPL, Whitefield & Malur',
        stations: [
          'KSR Bengaluru Majestic (SBC)',
          'Bengaluru Cantt (BNC)',
          'Bengaluru East (BNCE)',
          'Baiyyappanahalli (BYPL)',
          'Krishnarajapuram (KJM)',
          'Hoodi Halt (HDIH)',
          'Whitefield (WFD)',
          'Devangonthi (DVG)',
          'Malur (MLO)',
          'Tyakal (TCL)',
          'Bangarapet Jn (BWT)'
        ]
      },
      {
        id: 'bengaluru-mysuru-suburban',
        name: 'Line 2 (KSR Bengaluru ↔ Kengeri ↔ Bidadi ↔ Ramanagaram ↔ Mandya)',
        description: 'South-western industrial & university corridor towards Mysuru',
        stations: [
          'KSR Bengaluru Majestic (SBC)',
          'Nayandahalli (NYH)',
          'Jnana Bharati (GNB)',
          'Kengeri (KGI)',
          'Hejjala (HJL)',
          'Bidadi (BID)',
          'Ramanagaram (RMGM)',
          'Channapatna (CPT)',
          'Maddur (MAD)',
          'Mandya (MYA)'
        ]
      },
      {
        id: 'bengaluru-airport-line',
        name: 'Line 3 (KSR Bengaluru / Yesvantpur ↔ Yelahanka ↔ Devanahalli Airport Halt)',
        description: 'Northern corridor serving Yelahanka and Kempegowda Intl Airport',
        stations: [
          'KSR Bengaluru Majestic (SBC)',
          'Malleswaram (MWM)',
          'Yesvantpur Jn (YPR)',
          'Lottegollahalli (LOGH)',
          'Kodigehalli (KDGH)',
          'Yelahanka Jn (YNK)',
          'Bettahalsoor (DJL)',
          'Dodjala (DOJ)',
          'Kempegowda Intl Airport Halt (KIAD)',
          'Devanahalli (DHL)'
        ]
      }
    ]
  },
  {
    id: 'pune',
    name: 'Pune',
    networkName: 'Pune Suburban Railway (Central Railway)',
    lines: [
      {
        id: 'pune-lonavala',
        name: 'Pune ↔ Pimpri-Chinchwad ↔ Talegaon ↔ Lonavala Local',
        description: 'Vital commuter artery connecting Pune to PCMC industrial belt & Lonavala hill town',
        stations: [
          'Pune Jn (PUNE)',
          'Shivaji Nagar (SVJR)',
          'Khadki (KK)',
          'Dapodi (DAPD)',
          'Kasarwadi (KSWD)',
          'Pimpri (PMP)',
          'Chinchwad (CCH)',
          'Akurdi (AKRD)',
          'Dehu Road (DEHR)',
          'Begdewadi (BGWI)',
          'Ghorawadi (GRWD)',
          'Talegaon (TGN)',
          'Vadgaon (VDGN)',
          'Kanhe (KNHE)',
          'Kamshet (KMST)',
          'Malavli (MVL)',
          'Lonavala (LNL)'
        ]
      }
    ]
  }
];
