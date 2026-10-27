/**
 * state.js
 *
 * Project Tracker state management communicating with the FastAPI + SQLite REST API.
 * Uses X-API-Key authentication (configured in .env).
 */
(function (global) {
  const SECTION_ORDER = ['electrical', 'architectural', 'mechanical', 'plumbing', 'electronics', 'general', 'others'];
  const ACTIVE_USER_KEY = 'projectDashboardActiveUser';
  const AUTH_KEY = 'projectDashboardAuth';
  const API_KEY_STORAGE = 'projectDashboardApiKey';
  const WELCOME_KEY = 'projectDashboardWelcomeName';

  const SECTION_DEFS = {
    electrical: {
      title: 'Electrical',
      file: 'e_manage_subitems.html',
      lead: 'E-Team',
      scope: 'Lighting, Power and Controls',
      summary: 'Panelboards, Rough-ins, Raceway and Cables, lighting fixtures, baseboard CO, and addressable LED deliverables.',
      items: [
        { id: 'temp power', title: 'Temporary Power', percent: 0, notes: 'Temporary power setup and load testing.' },
        { id: 'panelboards', title: 'Panelboards / Distribution boards', percent: 0, notes: 'Distribution boards being landed and megger-tested per riser.' },
        { id: 'lighting', title: 'Lighting Fixture', percent: 0, notes: 'All lighting fixtures arrived?; ceiling zones hung and circuited.' },
        { id: 'raceway', title: 'Raceway and Cabling', percent: 0, notes: 'Conduits installed; cable pulling in progress.' },
        { id: 'power', title: 'Office Power Outlets - CO', percent: 0, notes: 'Outlet boxes installed; wiring connections.' },
        { id: 'power1', title: 'Electrical Room Power Outlets - CO', percent: 0, notes: 'Outlet installation and wiring.' },
        { id: 'power2', title: 'Pantry Power Outlets - CO', percent: 0, notes: 'Outlet boxes installed; wiring connections.' },
        { id: 'power3', title: 'Restroom Power Outlets - CO', percent: 0, notes: 'Outlet installation and wiring.' },
        { id: 'power4', title: 'Redemption Booth Power Outlets - CO', percent: 0, notes: 'Outlet boxes installed; wiring connections.' },
        { id: 'emergency power', title: 'Emergency Power Outlets - CO', percent: 0, notes: 'Outlet boxes installed; wiring connections.' },
        { id: 'emergency light', title: 'Emergency Light Fixture', percent: 0, notes: 'Emergency lighting circuits being tested; battery backup units being installed.' },
        { id: 'baseboard', title: 'Baseboard CO', percent: 0, notes: 'Branch rough-in finalized; QA walkthrough scheduled.' },
        { id: 'lighting control', title: 'Lighting Control System', percent: 0, notes: 'Control panels installed; programming and integration testing.' },
        { id: 'switch', title: 'Lighting Switches', percent: 0, notes: 'Manual switch installation and testing.' },
        { id: 'smart-led', title: 'Smart LED Addressable', percent: 0, notes: 'TWLED effects programming mock-up slated for next sprint.' },
        { id: 'rough-in', title: 'Rough-in for power and Lighting', percent: 0, notes: 'Terminal wiring in progress; coordination with architectural elements.' },
        { id: 'cable term', title: 'Cable Terminations', percent: 0, notes: 'PB cable terminations and connections underway; awaiting final inspection.' },
        { id: 'testing', title: 'Testing & Commissioning', percent: 0, notes: 'Pre-functional checklists being compiled for LV systems.' },
        { id: 'controls', title: 'Control Box / Control board', percent: 0, notes: 'Check ladder diagram if implemented and integration testing scheduled.' },
        { id: 'energize np', title: 'Normal Power', percent: 0, notes: 'System energization scheduled; coordination with utility provider pending.' },
        { id: 'insulation test', title: 'Megger testing', percent: 0, notes: 'Preparing documentation and punch list for final electrical inspection.' },
        { id: 'final inspection', title: 'Final Inspection', percent: 0, notes: 'Final walkthrough with authority having jurisdiction scheduled.' },
        { id: 'Feeder line', title: 'Feeder Line', percent: 0, notes: 'Feeder line and additional feeder lines being installed and tested.' },
        { id: 'as-builts', title: 'As-Built', percent: 0, notes: 'Redline markups being collected from site for documentation.' },
        { id: 'layout', title: 'Generator Installation 25kVA', percent: 0, notes: 'Emergency power supply' },
      ]
    },
    architectural: {
      title: 'Architectural',
      file: 'a_manage_subitems.html',
      lead: 'A-Team',
      scope: 'Signages, Interiors, Wall Finishes, Doors, Ceiling, Flooring, Final Inspection, As-Built',
      summary: 'Envelope systems, interior fit-out, public realm, and compliance packages tracked here.',
      items: [
        { id: 'signage', title: 'Signages Back Drop', percent: 0, notes: 'Signage installation progressing; final approvals to follow.' },
        { id: 'envelope', title: 'Building Envelope', percent: 0, notes: 'Envelope sealing and insulation works ongoing; weatherproofing.' },
        { id: 'windows', title: 'Windows and Glazing', percent: 0, notes: 'Window frames installed; glazing panels being fitted.' },
        { id: 'façade', title: 'Façade Works', percent: 0, notes: 'Cladding installation underway; finishing touches being applied.' },
        { id: 'roof', title: 'Roofing', percent: 0, notes: 'Roof membrane installation in progress; drainage systems being finalized.' },
        { id: 'interiors', title: 'Interior Fit-Out', percent: 0, notes: 'walls and flooring various stages of completion.' },
        { id: 'door0', title: 'Redemption Booth Doors and Cabinets', percent: 0, notes: 'Installation ongoing; hardware fitting.' },
        { id: 'door1', title: 'Office Doors and Cabinets', percent: 0, notes: 'Door frames set; glass panels being installed.' },
        { id: 'door1a', title: 'Office Sliding Doors', percent: 0, notes: 'Sliding mechanisms installed; glass panels being fitted.' },
        { id: 'door1b', title: 'Conference Room Doors and Cabinets', percent: 0, notes: 'Frames erected; door hardware installation.' },
        { id: 'door1c', title: 'Pantry Doors and Cabinets', percent: 0, notes: 'Door frames set; hardware fitting.' },
        { id: 'table', title: 'Office Tables and Cabinets', percent: 0, notes: 'Installation ongoing; final adjustments being made.' },
        { id: 'table1', title: 'Conference Room Table and Cabinets', percent: 0, notes: 'Table assembly in progress; finishing touches being applied.' },
        { id: 'pantry', title: 'Pantry Fixtures and Cabinets', percent: 0, notes: 'Fixture installation underway; cabinet adjustments.' },
        { id: 'shelving', title: 'Shelving Units', percent: 0, notes: 'Shelving units being installed; alignment checks.' },
        { id: 'table2', title: 'Electrical Room Tables and Cabinets', percent: 0, notes: 'Table assembly in progress; cabinet installation.' },
        { id: 'cabinet', title: 'Storage Cabinets', percent: 0, notes: 'Cabinet units being installed; shelving adjustments.' },
        { id: 'storage', title: 'Storage Doors and Lockers', percent: 0, notes: 'Locker installation underway; final alignment checks.' },
        { id: 'door2', title: 'Restroom Doors and Cabinets', percent: 0, notes: 'Partitions erected; door hardware installation.' },
        { id: 'door3', title: 'Electrical Room Doors and Cabinets', percent: 0, notes: 'Frames installed; final adjustments.' },
        { id: 'rollup door', title: 'Roll-Up Doors', percent: 0, notes: 'Roll-up door frames installed; motorized mechanisms being tested.' },
        { id: 'walls', title: 'Wall Finishes', percent: 0, notes: 'Painting and wall treatments nearing completion.' },
        { id: 'ceiling', title: 'Ceiling Works', percent: 0, notes: 'Ceiling grid installation and tile fitting.' },
        { id: 'paint', title: 'Painting', percent: 0, notes: 'Final coats of paint being applied; touch-ups scheduled.' },
        { id: 'trim', title: 'Trim and Millwork', percent: 0, notes: 'Baseboards, crown molding, and trim installation' },
        { id: 'domelight', title: 'Dome Light Fixture', percent: 0, notes: 'Fixture installation in progress; awaiting final adjustments.' },
        { id: 'Canopy', title: 'Canopy', percent: 0, notes: 'Installation scheduled completed; final measurements being confirmed.' },
        { id: 'flooring', title: 'Flooring', percent: 0, notes: 'Tiles and floor finishes being applied; polishing and sealing scheduled.' },
        { id: 'completion', title: 'Final Inspection', percent: 0, notes: 'Ready for final walkthrough and sign-off.' },
        { id: 'as-built', title: 'As-Built', percent: 0, notes: 'For processing of occupancy permits and final documentation.' },
        { id: 'public realm', title: 'Public Realm', percent: 0, notes: 'Landscaping and exterior hardscape works ongoing; final grading and planting.' },
        { id: 'compliance', title: 'Compliance and Permits', percent: 0, notes: 'Final inspections and documentation for occupancy permits in progress.' },
        { id: 'accessibility', title: 'Accessibility Features', percent: 0, notes: 'Installation of ramps, handrails, and signage for accessibility compliance.' },
        { id: 'fire-rating', title: 'Fire-Rated Assemblies', percent: 0, notes: 'Installation of fire-rated walls and doors; inspection for code compliance.' },
        { id: 'exterior', title: 'Exterior Finishes', percent: 0, notes: 'Final touches on exterior paint and finishes; weatherproofing checks.' },
        { id: 'interior finishes', title: 'Interior Finishes', percent: 0, notes: 'Final adjustments to interior paint, trim, and finishes.' },
        { id: 'punch list', title: 'Punch List Items', percent: 0, notes: 'Compiling punch list for final architectural inspection.' },
        { id: 'final walk', title: 'Final Walkthrough', percent: 0, notes: 'Scheduling final walkthrough with architect and client.' },
        { id: 'occupancy', title: 'Occupancy Permit', percent: 0, notes: 'Finalizing documentation and inspections for occupancy permit.' },
        { id: 'closeout', title: 'Project Closeout', percent: 0, notes: 'Collecting warranties, manuals, and final documentation for project closeout.' },
        { id: 'post-occupancy', title: 'Post-Occupancy Support', percent: 0, notes: 'Addressing any issues or adjustments needed after occupancy.' },
        { id: 'final sign-off', title: 'Final Sign-Off', percent: 0, notes: 'Obtaining final sign-off from all stakeholders.' },
        { id: 'as-builts', title: 'As-Built Drawings', percent: 0, notes: 'Redline markups being collected from site for documentation.' },
        { id: 'closeout documentation', title: 'Closeout Documentation', percent: 0, notes: 'Compiling all documentation, warranties, and manuals for project closeout.' },
        { id: 'final report', title: 'Final Project Report', percent: 0, notes: 'Preparing final report summarizing project outcomes and lessons learned.' },
      ]
    },
    mechanical: {
      title: 'Mechanical',
      file: 'm_manage_subitems.html',
      lead: 'M-Team',
      scope: 'HVAC, Plumbing, Fire Protection',
      summary: 'Air systems, hydronics, suppression, and automation integrations.',
      items: [
        { id: 'ahu', title: 'Air Handling Units Ducting ', percent: 0, notes: 'AHU balancing.' },
        { id: 'fcu', title: 'Fan Coil Units', percent: 0, notes: 'FCU installation and commissioning.' },
        { id: 'accu', title: 'Air-Cooled Condensing Units', percent: 0, notes: 'ACCU installation and refrigerant charging.' },
        { id: 'nema3r', title: 'NEMA 3R Enclosures', percent: 0, notes: 'Installation and wiring of NEMA 3R enclosures.' },
        { id: 'mcb', title: 'Motor Control Boxes', percent: 0, notes: 'MCB installation and motor testing.' },
        { id: 'mcb1', title: 'Main Circuit Breaker for ACCU', percent: 0, notes: 'MCB installation and motor testing for ACCU.' },
        { id: 'pumps', title: 'Pumps', percent: 0, notes: 'Pump installation and performance testing.' },
        { id: 'vfd', title: 'Variable Frequency Drives', percent: 0, notes: 'VFD installation and programming.' },
        { id: 'chiller', title: 'Chillers', percent: 0, notes: 'Chiller installation and commissioning.' },
        { id: 'mcc', title: 'Motor Control Centers', percent: 0, notes: 'MCC installation and motor testing.' },
        { id: 'exhaust fan', title: 'Exhaust Fans', percent: 0, notes: 'Exhaust fan installation and airflow testing.' },
        { id: 'circuiting', title: 'Circuiting and Controls', percent: 0, notes: 'Wiring and control system integration.' },
        { id: 'ductwork', title: 'Ductwork', percent: 0, notes: 'Duct installation and sealing.' },
        { id: 'hydronics', title: 'Hydronic Piping', percent: 0, notes: 'Chilled-water pipe insulation and testing.' },
        { id: 'suppression', title: 'Fire Suppression', percent: 0, notes: 'Pipe installation and pressure testing.' },
        { id: 'air balancing', title: 'Air Balancing', percent: 0, notes: 'Airflow measurements and adjustments.' },
        { id: 'automation', title: 'Building Automation System', percent: 0, notes: 'Control panel programming and sensor calibration.' },
        { id: 'testing', title: 'Testing & Commissioning', percent: 0, notes: 'Functional testing of HVAC and fire systems.' },
        { id: 'final inspection', title: 'Final Inspection', percent: 0, notes: 'Final walkthrough with authority having jurisdiction scheduled.' },
        { id: 'as-builts', title: 'As-Built', percent: 0, notes: 'Redline markups being collected from site for documentation.' },
        { id: 'ventilation', title: 'Ventilation Systems', percent: 0, notes: 'Ductwork installation and airflow testing.' },
        { id: 'chilled water', title: 'Chilled Water Systems', percent: 0, notes: 'Piping installation and pressure testing.' },
        { id: 'fire alarm', title: 'Fire Alarm System', percent: 0, notes: 'Device installation and system programming.' },
        { id: 'sprinklers', title: 'Sprinkler Systems', percent: 0, notes: 'Sprinkler head installation and system testing.' },
        { id: 'exhaust', title: 'Exhaust Systems', percent: 0, notes: 'Duct installation and airflow testing.' },
        { id: 'controls', title: 'Mechanical Controls', percent: 0, notes: 'Control system integration and testing.' },
        { id: 'energy recovery', title: 'Energy Recovery Systems', percent: 0, notes: 'Installation and commissioning of energy recovery ventilators.' },
        { id: 'maintenance', title: 'Maintenance and Training', percent: 0, notes: 'Scheduling maintenance training for facility staff.' },
        { id: 'commissioning', title: 'Final Commissioning', percent: 0, notes: 'Comprehensive system testing and commissioning.' },
        { id: 'documentation', title: 'Documentation and As-Builts', percent: 0, notes: 'Collecting documentation and redline markups for final records.' },
        { id: 'post-occupancy', title: 'Post-Occupancy Support', percent: 0, notes: 'Addressing any issues or adjustments needed after occupancy.' },
        { id: 'final sign-off', title: 'Final Sign-Off', percent: 0, notes: 'Obtaining final sign-off from all stakeholders.' }
      ]
    },
    plumbing: {
      title: 'Plumbing',
      file: 'p_manage_subitems.html',
      lead: 'P-Team',
      scope: 'Pipes, Fixtures, Valves',
      summary: 'Water supply, drainage, and fixture installations tracked here.',
      items: [
        { id: 'pipes', title: 'Pipes Installation', percent: 0, notes: 'Main and branch piping installation.' },
        { id: 'fixtures', title: 'Fixtures', percent: 0, notes: 'Fixture installation and testing.' },
        { id: 'valves', title: 'Valves', percent: 0, notes: 'Valve installation and calibration.' },
        { id: 'testing', title: 'Testing & Commissioning', percent: 0, notes: 'Pressure testing and leak checks.' },
        { id: 'final inspection', title: 'Final Inspection', percent: 0, notes: 'Final walkthrough with authority having jurisdiction scheduled.' },
        { id: 'as-builts', title: 'As-Built', percent: 0, notes: 'Redline markups being collected from site for documentation.' },
        { id: 'water supply', title: 'Water Supply Systems', percent: 0, notes: 'Supply line installation and pressure testing.' },
        { id: 'drainage', title: 'Drainage Systems', percent: 0, notes: 'Drain line installation and flow testing.' },
        { id: 'restroom', title: 'Restroom Fixtures', percent: 0, notes: 'Toilet and sink installation; final adjustments being made.' },
        { id: 'pantry', title: 'Pantry Fixtures', percent: 0, notes: 'Sink and faucet installation; water supply connections.' },
        { id: 'emergency', title: 'Emergency Fixtures', percent: 0, notes: 'Eyewash station and emergency shower installation.' },
        { id: 'water heaters', title: 'Water Heaters', percent: 0, notes: 'Water heater installation and system testing.' },
        { id: 'backflow', title: 'Backflow Prevention', percent: 0, notes: 'Backflow preventer installation and testing.' },
      ]
    },
    electronics: {
      title: 'Electronics',
      file: 'el_manage_subitems.html',
      lead: 'EL-Team',
      scope: 'Data Cabinets, CCTV, Smoke Detectors, Data and Telephone Cables',
      summary: 'Data cabinet, CCTV, Smoke detectors, Data and Telephone cables.',
      items: [
        { id: 'data-cabinet', title: 'Data Cabinet', percent: 0, notes: 'Installation and configuration.' },
        { id: 'cctv', title: 'CCTV', percent: 0, notes: 'Camera installation and testing ongoing.' },
        { id: 'smoke-detectors', title: 'Smoke Detectors', percent: 0, notes: 'Installation and calibration.' },
        { id: 'cables', title: 'Data and Telephone Cables', percent: 0, notes: 'Cable laying and termination.' },
        { id: 'testing', title: 'Testing & Commissioning', percent: 0, notes: 'System testing and troubleshooting.' },
        { id: 'final inspection', title: 'Final Inspection', percent: 0, notes: 'Final walkthrough with authority having jurisdiction.' },
        { id: 'as-builts', title: 'As-Built', percent: 0, notes: 'Redline markups being collected from site for documentation.' },
        { id: 'access control', title: 'Access Control Systems', percent: 0, notes: 'Installation and integration testing.' },
        { id: 'intercom', title: 'Intercom Systems', percent: 0, notes: 'Device installation and system testing.' },
        { id: 'audio-visual', title: 'Audio-Visual Systems', percent: 0, notes: 'AV equipment installation and configuration.' },
        { id: 'networking', title: 'Networking Infrastructure', percent: 0, notes: 'Switches and routers being configured; network testing.' },
        { id: 'cable management', title: 'Cable Management', percent: 0, notes: 'Cable trays and management systems being installed.' },
        { id: 'security', title: 'Security Systems', percent: 0, notes: 'Alarm system installation and testing in progress.' },
        { id: 'data-termination', title: 'Data Cable Termination', percent: 0, notes: 'Cable terminations and testing underway.' },
        { id: 'wireless', title: 'Wireless Access Points', percent: 0, notes: 'WAP installation and signal testing ongoing.' },
        { id: 'system-integration', title: 'System Integration', percent: 0, notes: 'Integration of electronic systems and final testing in progress.' },
        { id: 'documentation', title: 'Documentation and As-Builts', percent: 0, notes: 'Collecting documentation and redline markups for final records.' },
        { id: 'audio', title: 'Speaker Audio Systems', percent: 0, notes: 'Ready for final walkthrough and sign-off.' },
      ]
    },
    general: {
      title: 'General',
      file: 'g_manage_subitems.html',
      lead: 'General Team',
      scope: 'General tasks and miscellaneous items',
      summary: 'General tasks and miscellaneous items.',
      items: [
        { id: 'repair', title: 'Baseboard CO Repair', percent: 0, notes: 'Repairing baseboard CO units.' },
        { id: 'repair1', title: 'PanelBoards', percent: 0, notes: 'Replacement of circuit breakers.' },
        { id: 'safety', title: 'Electrical Safety Audit', percent: 0, notes: 'Electrical safety Requirements' },
        { id: 'e-plan1', title: 'Load Schedule', percent: 0, notes: 'Total Lighting and Machine Load' },
        { id: 'e-plan2', title: 'Power Layout', percent: 0, notes: 'Overall power Layout including Mechanical Load' },
        { id: 'e-plan4', title: 'Lighting Layout', percent: 0, notes: 'Complete Lighting layout including switch' },
        { id: 'e-plan5', title: 'Electrical Design Analysis', percent: 0, notes: 'To comply with the electrical safety standards with the application of PEC or NEC and Computation of Complex Electrical circuit Networks including short Circuit Current and Voltage Drop' },
        { id: 'e-plan3', title: 'Riser Diagram', percent: 0, notes: 'Also Called Single Line Diagram Electrical Interconnection - Backbone' },
      ]
    },
    others: {
      title: 'Others',
      file: 'o_manage_subitems.html',
      lead: 'Others Team',
      scope: 'Other tasks and miscellaneous items',
      summary: 'Other tasks and miscellaneous items.',
      items: [
        { id: 'project-monitoring', title: 'Project Tracker Development', percent: 0, notes: 'Monitoring of Project Developments and other concerns' },
        { id: 'software1', title: 'Development of Project Tracker V1.0.0', percent: 0, notes: 'Checks projects flow and User Testing' },
        { id: 'soft2', title: 'Requirements & Planning', percent: 0, notes: 'features, constraints, success criteria' },
        { id: 'soft3', title: 'System & Architecture Design', percent: 0, notes: 'Choose tech stack (frontend, backend, database, hosting)' },
        { id: 'soft4', title: 'Development Setup', percent: 0, notes: 'Create initial project structure following best practices' },
        { id: 'soft5', title: 'Coding & Implementation', percent: 0, notes: 'Avoid hard‑coded values (use config/env), Ensure error handling & logging is implemented' },
        { id: 'soft6', title: 'Testing', percent: 0, notes: 'Unit testing, Integration testing, API testing (Postman, Insomnia), UI/UX testing, - Performance testing (load, stress, concurrency), Security testing (OWASP checks, input validation)' },
        { id: 'soft7', title: 'Pre‑Deployment', percent: 0, notes: 'Review CI/CD pipeline status, - Perform code review (peer or self‑review checklist), Validate backup & rollback strategy, Finalize documentation (API docs, deployment notes, changelog)' },
        { id: 'soft8', title: 'Deployment', percent: 0, notes: 'Deploy to staging for final validation, Verify system health (CPU, RAM, logs, uptime), Validate database migrations' },
        { id: 'soft9', title: 'Post‑Deployment', percent: 0, notes: 'Collect user feedback, fix urgent bugs, Update documentation, conduct retrospective (what worked, what didn’t)' },
        { id: 'soft10', title: 'Maintenance', percent: 0, notes: 'Apply security patches, - Optimize performance (queries, caching, CDN), Review logs regularly, Update dependencies, Maintain backups & disaster recovery plans' },
        { id: 'software', title: 'Google Play Deployment', percent: 0, notes: 'Check deployment status on Google play store' },
        { id: 'load-balancing', title: 'Load Balancing', percent: 0, notes: 'Machine load balancing' },
      ]
    }
  };

  // ──────────────────────────────────────────────────
  // Custom sections — user-defined sections stored by the backend (/api/custom_sections).
  // They are appended to SECTION_ORDER / SECTION_DEFS in place, so every page that loops
  // over SECTION_ORDER (dashboards, Gantt creator, pickers) picks them up automatically.
  // ──────────────────────────────────────────────────
  const BUILTIN_SECTION_ORDER = [...SECTION_ORDER];
  const CUSTOM_SECTIONS_CACHE_KEY = 'projectDashboardCustomSections';
  const CUSTOM_SECTION_PAGE = 'c_manage_subitems.html';

  // Colour themes for custom sections; a section's colorIndex (from the server) picks one
  const CUSTOM_SECTION_PALETTE = [
    { solid: '#65a30d', light: '#a3e635', rgb: '163, 230, 53', label: '#3f6212', printBg: '#ecfccb', printBorder: '#d9f99d' },
    { solid: '#c026d3', light: '#e879f9', rgb: '232, 121, 249', label: '#86198f', printBg: '#fae8ff', printBorder: '#f5d0fe' },
    { solid: '#4f46e5', light: '#818cf8', rgb: '129, 140, 248', label: '#3730a3', printBg: '#e0e7ff', printBorder: '#c7d2fe' },
    { solid: '#0891b2', light: '#22d3ee', rgb: '34, 211, 238', label: '#155e75', printBg: '#cffafe', printBorder: '#a5f3fc' },
    { solid: '#ca8a04', light: '#facc15', rgb: '250, 204, 21', label: '#854d0e', printBg: '#fef9c3', printBorder: '#fef08a' },
    { solid: '#db2777', light: '#f472b6', rgb: '244, 114, 182', label: '#9d174d', printBg: '#fce7f3', printBorder: '#fbcfe8' },
  ];
  // Built-in section colours (bar fill + darker label shade) used by canvas/PDF exports
  const BUILTIN_SECTION_COLORS = {
    electrical: { solid: '#f59e0b', label: '#b45309' },
    architectural: { solid: '#8b5cf6', label: '#6d28d9' },
    mechanical: { solid: '#22c55e', label: '#15803d' },
    plumbing: { solid: '#38bdf8', label: '#0369a1' },
    electronics: { solid: '#f43f5e', label: '#be123c' },
    general: { solid: '#f97316', label: '#c2410c' },
    others: { solid: '#14b8a6', label: '#0f766e' },
  };

  const isCustomSection = (key) => Boolean(SECTION_DEFS[key] && SECTION_DEFS[key].custom);

  const getSectionColor = (key) => {
    if (BUILTIN_SECTION_COLORS[key]) { return BUILTIN_SECTION_COLORS[key]; }
    if (isCustomSection(key)) {
      const index = Math.abs(Number(SECTION_DEFS[key].colorIndex) || 0) % CUSTOM_SECTION_PALETTE.length;
      return CUSTOM_SECTION_PALETTE[index];
    }
    return { solid: '#38bdf8', label: '#0369a1' };
  };

  /** "Electrical" -> "Electrical Section"; "Mechanical Section no.2" stays as typed. */
  const getSectionDisplayName = (key) => {
    const title = (SECTION_DEFS[key] && SECTION_DEFS[key].title) || key;
    return /\bsection\b/i.test(title) ? title : `${title} Section`;
  };

  const toCustomDefinition = (raw) => ({
    title: String(raw.title || raw.key),
    file: `${CUSTOM_SECTION_PAGE}?key=${encodeURIComponent(raw.key)}`,
    lead: raw.lead || 'Custom Team',
    scope: raw.scope || '',
    summary: raw.summary || '',
    items: Array.isArray(raw.items)
      ? raw.items.map((item) => ({ id: String(item.id), title: String(item.title || ''), percent: 0, notes: item.notes || '' }))
      : [],
    custom: true,
    colorIndex: Number(raw.colorIndex) || 0,
    createdBy: raw.createdBy || '',
  });

  /** Colour classes (.bar-KEY, .bg-KEY, .sec-color-KEY, .card-icon--KEY) mirroring the built-in ones. */
  const injectCustomSectionStyles = () => {
    if (!global.document || !global.document.head) { return; }
    let styleEl = global.document.getElementById('customSectionStyles');
    if (!styleEl) {
      styleEl = global.document.createElement('style');
      styleEl.id = 'customSectionStyles';
      global.document.head.appendChild(styleEl);
    }
    styleEl.textContent = SECTION_ORDER.filter(isCustomSection).map((key) => {
      const t = getSectionColor(key);
      return `
.bar-${key} { background: linear-gradient(90deg, ${t.solid}, ${t.light}); }
.bg-${key} { background: rgba(${t.rgb}, 0.1); color: ${t.light}; }
.sec-color-${key} { border-left: 4px solid ${t.light}; }
.card-icon--${key} { background: rgba(${t.rgb}, 0.12); color: ${t.light}; }
@media print {
  .bar-${key} { background: ${t.solid} !important; }
  .bg-${key} { background: ${t.printBg} !important; color: ${t.label} !important; border: 1px solid ${t.printBorder} !important; }
}`;
    }).join('\n');
  };

  const registerCustomSections = (list) => {
    if (!Array.isArray(list)) { return; }
    for (let i = SECTION_ORDER.length - 1; i >= 0; i -= 1) {
      const key = SECTION_ORDER[i];
      if (!BUILTIN_SECTION_ORDER.includes(key)) {
        delete SECTION_DEFS[key];
        SECTION_ORDER.splice(i, 1);
      }
    }
    list.forEach((raw) => {
      if (!raw || !raw.key || BUILTIN_SECTION_ORDER.includes(raw.key)) { return; }
      SECTION_DEFS[raw.key] = toCustomDefinition(raw);
      SECTION_ORDER.push(raw.key);
    });
    injectCustomSectionStyles();
  };

  const listCustomSections = () => SECTION_ORDER.filter(isCustomSection).map((key) => ({ key, ...SECTION_DEFS[key] }));

  // Register the last known custom sections right away so pages can render before the API answers
  try {
    const cached = global.localStorage && global.localStorage.getItem(CUSTOM_SECTIONS_CACHE_KEY);
    if (cached) { registerCustomSections(JSON.parse(cached)); }
  } catch (error) {
    // ignore unreadable cache
  }

  const STORAGE_KEY = 'projectDashboardState';
  const API_BASE = 'api';
  let memoryFallback = null;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const fmtDate = (date) => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        year: 'numeric', month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      }).format(date);
    } catch (error) {
      if (date && typeof date.toString === 'function') {
        return date.toString();
      }
      return '';
    }
  };

  const statusClass = (percent) => {
    if (percent >= 100) return { text: 'Completed', cls: 'ontrack' };
    if (percent >= 80) return { text: 'On Track', cls: 'ontrack' };
    if (percent >= 10) return { text: 'On ongoing', cls: 'atrisk' };
    if (percent >= 5) return { text: 'Just Started', cls: 'delayed' };
    return { text: 'Started', cls: 'started' };
  };

  const randomId = () => `project-${Math.random().toString(36).slice(2, 10)}`;

  const cloneItems = (items = []) => items.map((item) => ({ ...item }));

  const cloneSections = (sections = {}) => {
    const cloned = {};
    SECTION_ORDER.forEach((key) => {
      const source = sections[key];
      if (!source) {
        cloned[key] = undefined;
        return;
      }
      cloned[key] = {
        ...source,
        items: Array.isArray(source.items) ? cloneItems(source.items) : undefined
      };
    });
    return cloned;
  };

  const ensureSectionList = (list) => {
    if (!Array.isArray(list) || list.length === 0) {
      return [...SECTION_ORDER];
    }
    const filtered = list.filter((key) => SECTION_ORDER.includes(key));
    return filtered.length ? filtered : [...SECTION_ORDER];
  };

  const pruneDisabledSections = (project) => {
    if (!project || !project.sections || !project.enabledSections) { return; }
    SECTION_ORDER.forEach((key) => {
      if (project.enabledSections[key] === false) {
        delete project.sections[key];
      }
    });
  };

  const setEnabledSections = (project, includedSections) => {
    const list = ensureSectionList(includedSections);
    const selection = new Set(list);
    project.enabledSections = project.enabledSections || {};
    SECTION_ORDER.forEach((key) => {
      project.enabledSections[key] = selection.has(key);
    });
    pruneDisabledSections(project);
  };

  const resetSectionProgress = (project) => {
    if (!project || !project.sections) { return; }
    SECTION_ORDER.forEach((key) => {
      const section = project.sections[key];
      if (section && Array.isArray(section.items)) {
        section.items = section.items.map((item) => ({ ...item, percent: 0 }));
      }
    });
  };

  const normalizeSection = (key, sourceSection = {}) => {
    const definition = SECTION_DEFS[key];
    const hasSavedItems = Array.isArray(sourceSection.items) && sourceSection.items.length > 0;

    let items;
    if (hasSavedItems) {
      items = sourceSection.items.map((saved) => {
        const def = definition.items.find((d) => d.id === saved.id);
        const merged = def ? { ...def, ...saved } : { ...saved };
        if (typeof merged.tracked === 'undefined') {
          merged.tracked = true;
        }
        return merged;
      });
    } else {
      items = definition.items.map((item) => {
        const merged = { ...item };
        if (typeof merged.tracked === 'undefined') {
          merged.tracked = true;
        }
        return merged;
      });
    }

    return {
      ...sourceSection,
      ...definition,
      items
    };
  };

  const normalizeProject = (project = {}) => {
    const normalized = {
      id: project.id || randomId(),
      title: project.title || 'Project Developments',
      description: project.description || '',
      status: project.status || 'in_progress',
      createdAt: project.createdAt || new Date().toISOString(),
      lastUpdate: project.lastUpdate || new Date().toISOString(),
      lastUpdatedBy: project.lastUpdatedBy || 'System',
      sections: {},
      enabledSections: {}
    };

    const includedList = Array.isArray(project.includedSections)
      ? ensureSectionList(project.includedSections)
      : null;

    SECTION_ORDER.forEach((key) => {
      let enabled;
      if (project.enabledSections && typeof project.enabledSections === 'object'
        && Object.prototype.hasOwnProperty.call(project.enabledSections, key)) {
        enabled = project.enabledSections[key] !== false;
      } else if (includedList) {
        enabled = includedList.includes(key);
      } else {
        // Built-in sections are on by default; custom sections only once a project opts in
        enabled = !isCustomSection(key);
      }

      normalized.enabledSections[key] = enabled;
      if (enabled) {
        const incoming = project.sections ? project.sections[key] : undefined;
        normalized.sections[key] = normalizeSection(key, incoming);
      }
    });

    // Keep sections whose definition is not loaded (e.g. custom sections while offline)
    // so a later save never drops their progress.
    Object.keys(project.sections || {}).forEach((key) => {
      if (SECTION_ORDER.includes(key) || !project.sections[key]) { return; }
      normalized.sections[key] = project.sections[key];
      normalized.enabledSections[key] = !project.enabledSections || project.enabledSections[key] !== false;
    });

    if (!Object.keys(normalized.enabledSections).length) {
      setEnabledSections(normalized, SECTION_ORDER);
    } else {
      pruneDisabledSections(normalized);
    }

    return normalized;
  };

  const createProject = (title = 'Project Developments', includedSections, extra = {}) => {
    const project = normalizeProject({ title, includedSections, ...extra });
    resetSectionProgress(project);
    return project;
  };

  const cloneProject = (project, title, resetProgress = false, includedSections, extra = {}) => {
    if (!project) {
      return createProject(title, includedSections, extra);
    }
    const normalized = normalizeProject({
      title: title || project.title,
      description: extra.description !== undefined ? extra.description : (project.description || ''),
      status: extra.status || 'not_started',
      sections: cloneSections(project.sections),
      enabledSections: project.enabledSections
    });
    if (includedSections) {
      setEnabledSections(normalized, includedSections);
    }
    if (resetProgress) {
      resetSectionProgress(normalized);
    }
    return normalized;
  };

  const createDefaultState = () => {
    const project = createProject();
    return {
      activeProjectId: project.id,
      projects: { [project.id]: project }
    };
  };

  const legacyToState = (legacy = {}) => {
    const project = normalizeProject({
      id: legacy.id,
      title: legacy.projectTitle,
      lastUpdate: legacy.lastUpdate,
      sections: legacy.sections
    });
    return {
      activeProjectId: project.id,
      projects: { [project.id]: project }
    };
  };

  const normalizeState = (rawState) => {
    if (!rawState || typeof rawState !== 'object') {
      return createDefaultState();
    }

    if (!rawState.projects || !rawState.activeProjectId) {
      return legacyToState(rawState);
    }

    const projects = {};
    Object.values(rawState.projects).forEach((project) => {
      const normalized = normalizeProject(project);
      projects[normalized.id] = normalized;
    });

    let activeProjectId = rawState.activeProjectId;
    if (!projects[activeProjectId]) {
      activeProjectId = Object.keys(projects)[0];
    }
    if (!activeProjectId) {
      const project = createProject();
      projects[project.id] = project;
      activeProjectId = project.id;
    }

    return { activeProjectId, projects };
  };

  // ──────────────────────────────────────────────────
  // API-Key & RBAC Session Authentication Helpers
  // ──────────────────────────────────────────────────
  const SESSION_TOKEN_KEY = 'projectDashboardSessionToken';
  const USER_ROLE_KEY = 'projectDashboardUserRole';
  const USER_PROFILE_KEY = 'projectDashboardUserProfile';

  const readStorageItem = (key) => {
    try {
      const sVal = global.sessionStorage && global.sessionStorage.getItem(key);
      if (sVal) return sVal;
      const lVal = global.localStorage && global.localStorage.getItem(key);
      if (lVal) return lVal;
    } catch (e) {
      // ignore storage errors
    }
    return '';
  };

  const getApiKey = () => readStorageItem(API_KEY_STORAGE);
  const getSessionToken = () => readStorageItem(SESSION_TOKEN_KEY);

  const getCurrentUser = () => {
    try {
      const raw = readStorageItem(USER_PROFILE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      // ignore parse errors
    }
    const username = readStorageItem(ACTIVE_USER_KEY) || 'Admin';
    const role = readStorageItem(USER_ROLE_KEY) || 'admin';
    return { username, fullName: username, role };
  };

  const getUserRole = () => {
    const user = getCurrentUser();
    return (user && user.role ? String(user.role).toLowerCase() : readStorageItem(USER_ROLE_KEY) || 'admin');
  };

  const isAdmin = () => getUserRole() === 'admin';

  const setAuthSession = ({ token, user, apiKey, remember = true }) => {
    try {
      const primary = remember ? global.localStorage : global.sessionStorage;
      const secondary = remember ? global.sessionStorage : global.localStorage;
      const displayName = (user && (user.fullName || user.username)) || 'Admin';
      const role = (user && user.role) || 'admin';

      if (primary) {
        primary.setItem(AUTH_KEY, 'granted');
        if (apiKey) primary.setItem(API_KEY_STORAGE, apiKey);
        if (token) primary.setItem(SESSION_TOKEN_KEY, token);
        primary.setItem(ACTIVE_USER_KEY, displayName);
        primary.setItem(USER_ROLE_KEY, role);
        if (user) primary.setItem(USER_PROFILE_KEY, JSON.stringify(user));
      }
      if (secondary) {
        [AUTH_KEY, API_KEY_STORAGE, SESSION_TOKEN_KEY, ACTIVE_USER_KEY, USER_ROLE_KEY, USER_PROFILE_KEY].forEach((k) =>
          secondary.removeItem(k)
        );
      }
      if (global.sessionStorage) {
        global.sessionStorage.setItem(WELCOME_KEY, displayName);
      }
    } catch (e) {
      // ignore storage errors
    }
  };

  const isAuthenticated = () => {
    try {
      const key = getApiKey();
      const token = getSessionToken();
      const localAuth = global.localStorage && global.localStorage.getItem(AUTH_KEY);
      const sessionAuth = global.sessionStorage && global.sessionStorage.getItem(AUTH_KEY);
      return (Boolean(key) || Boolean(token)) && (localAuth === 'granted' || sessionAuth === 'granted');
    } catch (e) {
      return false;
    }
  };

  const logout = () => {
    try {
      const token = getSessionToken();
      const apiKey = getApiKey();
      if (token || apiKey) {
        fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { 'X-API-Key': apiKey } : {}),
            ...(token ? { 'X-Session-Token': token } : {}),
          },
        }).catch(() => {});
      }
      [
        AUTH_KEY,
        API_KEY_STORAGE,
        SESSION_TOKEN_KEY,
        ACTIVE_USER_KEY,
        USER_ROLE_KEY,
        USER_PROFILE_KEY,
        WELCOME_KEY,
      ].forEach((k) => {
        if (global.localStorage) global.localStorage.removeItem(k);
        if (global.sessionStorage) global.sessionStorage.removeItem(k);
      });
    } catch (e) {
      // ignore storage errors
    }
  };

  const apiFetch = async (endpoint, options = {}) => {
    const apiKey = getApiKey();
    const sessionToken = getSessionToken();
    const currentUser = getCurrentUser();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }
    if (sessionToken) {
      headers['X-Session-Token'] = sessionToken;
      if (!headers['Authorization']) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
      }
    }
    if (currentUser && currentUser.username) {
      headers['X-User-Name'] = currentUser.username;
    }
    if (currentUser && currentUser.role) {
      headers['X-User-Role'] = currentUser.role;
    }
    const cleanEndpoint = endpoint.replace(/^\/?api\//, '').replace(/\.php(\?|$)/, '$1');
    const response = await fetch(`${API_BASE}/${cleanEndpoint}`, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error('❌ API returned non-JSON response:', response.status, text.substring(0, 500));
      throw new Error(`API error ${response.status}: ${text.substring(0, 200)}`);
    }

    if (!response.ok) {
      console.error('❌ API error:', response.status, data);
      const apiError = new Error(data.error || `API error ${response.status}`);
      apiError.status = response.status;
      throw apiError;
    }
    return data;
  };

  // ──────────────────────────────────────────────────
  // Universal Toast Notification & Change Password Modal
  // ──────────────────────────────────────────────────
  let globalToastTimer = null;
  const showToast = (message, type = 'success') => {
    if (!global.document) return;
    let toast = global.document.getElementById('agyGlobalToast');
    if (!toast) {
      toast = global.document.createElement('div');
      toast.id = 'agyGlobalToast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      toast.style.cssText = [
        'position:fixed',
        'bottom:24px',
        'right:24px',
        'z-index:99999',
        'padding:13px 20px',
        'border-radius:12px',
        'font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif',
        'font-size:0.9rem',
        'font-weight:600',
        'color:#f8fafc',
        'box-shadow:0 14px 36px rgba(0,0,0,0.45)',
        'border:1px solid rgba(148,163,184,0.25)',
        'transition:opacity 0.22s ease,transform 0.22s ease',
        'opacity:0',
        'transform:translateY(10px)',
        'pointer-events:none',
        'max-width:420px',
      ].join(';');
      global.document.body.appendChild(toast);
    }
    const bgMap = {
      success: 'linear-gradient(135deg,#059669,#10b981)',
      error: 'linear-gradient(135deg,#dc2626,#ef4444)',
      info: 'linear-gradient(135deg,#0284c7,#38bdf8)',
    };
    toast.style.background = bgMap[type] || bgMap.success;
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    clearTimeout(globalToastTimer);
    globalToastTimer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
    }, 3400);
  };

  const openChangePasswordModal = () => {
    if (!global.document) return;
    let modal = global.document.getElementById('agyChangePwdModal');
    if (!modal) {
      modal = global.document.createElement('div');
      modal.id = 'agyChangePwdModal';
      modal.style.cssText = [
        'position:fixed',
        'inset:0',
        'z-index:99990',
        'background:rgba(2,6,23,0.78)',
        'backdrop-filter:blur(6px)',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'padding:16px',
      ].join(';');
      modal.innerHTML = `
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:18px;max-width:420px;width:100%;padding:24px;color:#f8fafc;box-shadow:0 24px 60px rgba(0,0,0,0.6);font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <h3 style="margin:0;font-size:1.15rem;font-weight:700;">Change My Password</h3>
            <button type="button" id="agyPwdCloseBtn" style="background:transparent;border:none;color:#94a3b8;font-size:1.3rem;cursor:pointer;line-height:1;">&times;</button>
          </div>
          <p style="margin:0 0 16px;font-size:0.86rem;color:#94a3b8;">Update the password for your account (<strong>${(getCurrentUser().username || 'User')}</strong>).</p>
          <form id="agyChangePwdForm" style="display:grid;gap:14px;">
            <div>
              <label style="display:block;font-size:0.8rem;font-weight:600;color:#cbd5e1;margin-bottom:5px;">Current Password</label>
              <input type="password" id="agyCurrentPwd" required placeholder="Enter current password" style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid #334155;background:#0b1222;color:#f8fafc;font-size:0.92rem;" />
            </div>
            <div>
              <label style="display:block;font-size:0.8rem;font-weight:600;color:#cbd5e1;margin-bottom:5px;">New Password (min. 6 chars)</label>
              <input type="password" id="agyNewPwd" required minlength="6" placeholder="Enter new password" style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid #334155;background:#0b1222;color:#f8fafc;font-size:0.92rem;" />
            </div>
            <div>
              <label style="display:block;font-size:0.8rem;font-weight:600;color:#cbd5e1;margin-bottom:5px;">Confirm New Password</label>
              <input type="password" id="agyConfirmPwd" required minlength="6" placeholder="Repeat new password" style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid #334155;background:#0b1222;color:#f8fafc;font-size:0.92rem;" />
            </div>
            <div id="agyPwdFeedback" style="font-size:0.84rem;min-height:18px;color:#f87171;"></div>
            <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:4px;">
              <button type="button" id="agyPwdCancelBtn" style="padding:9px 16px;border-radius:999px;border:1px solid #334155;background:transparent;color:#cbd5e1;font-weight:600;cursor:pointer;">Cancel</button>
              <button type="submit" style="padding:9px 18px;border-radius:999px;border:none;background:linear-gradient(135deg,#0284c7,#38bdf8);color:#082f49;font-weight:700;cursor:pointer;">Update Password</button>
            </div>
          </form>
        </div>
      `;
      global.document.body.appendChild(modal);

      const close = () => {
        modal.style.display = 'none';
        const f = global.document.getElementById('agyChangePwdForm');
        if (f) f.reset();
        const fb = global.document.getElementById('agyPwdFeedback');
        if (fb) fb.textContent = '';
      };

      global.document.getElementById('agyPwdCloseBtn').addEventListener('click', close);
      global.document.getElementById('agyPwdCancelBtn').addEventListener('click', close);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) close();
      });

      global.document.getElementById('agyChangePwdForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const cur = global.document.getElementById('agyCurrentPwd').value;
        const nw = global.document.getElementById('agyNewPwd').value;
        const cf = global.document.getElementById('agyConfirmPwd').value;
        const fb = global.document.getElementById('agyPwdFeedback');
        fb.textContent = '';

        if (nw !== cf) {
          fb.textContent = 'New password and confirmation do not match.';
          return;
        }
        if (nw.length < 6) {
          fb.textContent = 'New password must be at least 6 characters.';
          return;
        }
        try {
          await apiFetch('auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ currentPassword: cur, newPassword: nw }),
          });
          close();
          showToast('Your password has been updated successfully.', 'success');
        } catch (err) {
          fb.textContent = err.message || 'Failed to update password.';
        }
      });
    }
    modal.style.display = 'flex';
    const input = global.document.getElementById('agyCurrentPwd');
    if (input) setTimeout(() => input.focus(), 50);
  };

  // Inject RBAC navigation bar across authenticated pages
  const mountRbacNavigationBar = () => {
    if (!global.document || !global.document.body) return;
    const path = (global.location && global.location.pathname) || '';
    if (path.endsWith('login.html')) {
      const badge = global.document.querySelector('.brand-badge');
      if (badge) {
        badge.style.cssText = 'width:72px;height:72px;flex-shrink:0;border-radius:16px;background:radial-gradient(circle at 50% 35%, rgba(56, 189, 248, 0.18), rgba(15, 23, 42, 0.85));border:1px solid rgba(56, 189, 248, 0.28);padding:6px;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 25px rgba(0, 0, 0, 0.45), 0 0 20px rgba(56, 189, 248, 0.14);overflow:hidden;';
        if (!badge.querySelector('img')) {
          badge.innerHTML = '<img src="images/project_tracker_25p.png?v=2" onerror="this.onerror=null;this.src=\'/images/project_tracker_25p.png\';" alt="Project Tracker Logo" class="brand-logo" style="width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.45));" />';
        }
      }
      return;
    }
    if (path.endsWith('404.html') || global.document.getElementById('agyRbacTopbar')) {
      return;
    }
    if (!isAuthenticated()) return;

    const user = getCurrentUser();
    const role = getUserRole();
    const admin = role === 'admin';

    if (global.document.head && !global.document.getElementById('agyRbacPrintStyle')) {
      const styleEl = global.document.createElement('style');
      styleEl.id = 'agyRbacPrintStyle';
      styleEl.textContent = `
        #agyRbacTopbar {
          background: rgba(15,23,42,0.95);
          border-bottom: 1px solid rgba(56,189,248,0.22);
          padding: 8px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          font-family: system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
          font-size: 0.84rem;
          color: #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 9990;
          backdrop-filter: blur(8px);
        }
        @media print {
          #agyRbacTopbar,
          #agyChangePwdModal,
          #agyToastContainer,
          .no-print {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            max-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            overflow: hidden !important;
          }
        }
      `;
      global.document.head.appendChild(styleEl);
    }

    const bar = global.document.createElement('nav');
    bar.id = 'agyRbacTopbar';
    bar.className = 'no-print';
    bar.setAttribute('aria-label', 'Role-based navigation');

    if (global.addEventListener) {
      global.addEventListener('beforeprint', () => {
        bar.style.setProperty('display', 'none', 'important');
      });
      global.addEventListener('afterprint', () => {
        bar.style.removeProperty('display');
      });
    }

    const roleBadgeStyle = admin
      ? 'background:rgba(56,189,248,0.18);color:#38bdf8;border:1px solid rgba(56,189,248,0.45);'
      : 'background:rgba(34,197,94,0.16);color:#4ade80;border:1px solid rgba(34,197,94,0.4);';

    const linkStyle = (target) => {
      const active = path.endsWith(target);
      return [
        'text-decoration:none',
        'padding:6px 12px',
        'border-radius:999px',
        'font-weight:600',
        'transition:all 0.15s ease',
        active
          ? 'background:#38bdf8;color:#082f49;'
          : 'background:rgba(30,41,59,0.75);color:#cbd5e1;border:1px solid rgba(148,163,184,0.2);',
      ].join(';');
    };

    bar.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <span style="font-weight:700;color:#f8fafc;letter-spacing:0.2px;">⚡ Project Tracker</span>
        <span style="padding:3px 10px;border-radius:999px;font-size:0.74rem;font-weight:700;text-transform:uppercase;${roleBadgeStyle}">
          ${admin ? 'Admin' : 'Regular User'}
        </span>
        <span style="color:#94a3b8;">Signed in as <strong style="color:#f8fafc;">${user.fullName || user.username}</strong> (@${user.username})</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        ${admin ? `<a href="admin_dashboard.html" style="${linkStyle('admin_dashboard.html')}">🛡️ Admin & Users</a>` : ''}
        <a href="user_index.html" style="${linkStyle('user_index.html')}">📊 Projects Dashboard</a>
        <a href="gantt_chart_creator.html" style="${linkStyle('gantt_chart_creator.html')}">📅 Gantt Studio</a>
        <a href="completed_project.html" style="${linkStyle('completed_project.html')}">✅ Completed</a>
        <a href="user_update_logs.html" style="${linkStyle('user_update_logs.html')}">🕓 Activity Logs</a>
        <button type="button" id="agyTopbarChangePwdBtn" style="padding:6px 12px;border-radius:999px;border:1px solid rgba(56,189,248,0.35);background:rgba(15,23,42,0.8);color:#38bdf8;font-weight:600;cursor:pointer;font-size:0.82rem;">🔑 Change Password</button>
        <button type="button" id="agyTopbarLogoutBtn" style="padding:6px 12px;border-radius:999px;border:1px solid rgba(239,68,68,0.4);background:rgba(239,68,68,0.12);color:#fca5a5;font-weight:600;cursor:pointer;font-size:0.82rem;">Sign Out</button>
      </div>
    `;

    global.document.body.insertBefore(bar, global.document.body.firstChild);

    const pwdBtn = global.document.getElementById('agyTopbarChangePwdBtn');
    if (pwdBtn) pwdBtn.addEventListener('click', openChangePasswordModal);

    const outBtn = global.document.getElementById('agyTopbarLogoutBtn');
    if (outBtn) {
      outBtn.addEventListener('click', () => {
        logout();
        global.location.href = 'login.html';
      });
    }
  };

  if (global.document) {
    if (global.document.readyState === 'loading') {
      global.document.addEventListener('DOMContentLoaded', mountRbacNavigationBar);
    } else {
      setTimeout(mountRbacNavigationBar, 0);
    }
  }

  // ──────────────────────────────────────────────────
  // State persistence — FastAPI SQLite Backend
  // ──────────────────────────────────────────────────
  const loadCustomSections = async () => {
    try {
      const result = await apiFetch('custom_sections');
      const list = Array.isArray(result.data) ? result.data : (result.sections || []);
      registerCustomSections(list);
      try {
        global.localStorage && global.localStorage.setItem(CUSTOM_SECTIONS_CACHE_KEY, JSON.stringify(list));
      } catch (error) {
        // ignore storage errors
      }
    } catch (error) {
      console.warn('Custom sections could not be loaded; using cached list.', error.message);
    }
    return listCustomSections();
  };

  const createCustomSection = async (payload) => {
    const result = await apiFetch('custom_sections', { method: 'POST', body: JSON.stringify(payload) });
    await loadCustomSections();
    return result.section;
  };

  const updateCustomSection = async (key, payload) => {
    const result = await apiFetch(`custom_sections/${encodeURIComponent(key)}`, { method: 'PATCH', body: JSON.stringify(payload) });
    await loadCustomSections();
    return result.section;
  };

  /** Deleting requires an administrator's credentials: { adminUsername, adminPassword }. */
  const deleteCustomSection = async (key, approval = {}) => {
    const result = await apiFetch(`custom_sections/${encodeURIComponent(key)}`, {
      method: 'DELETE',
      body: JSON.stringify({ adminUsername: approval.adminUsername || '', adminPassword: approval.adminPassword || '' }),
    });
    await loadCustomSections();
    return result;
  };

  /** Turn a section on/off for one project (off removes that project's progress for it). */
  const setSectionEnabledForProject = (project, key, enabled) => {
    if (!project || !SECTION_DEFS[key]) { return; }
    project.enabledSections = project.enabledSections || {};
    project.sections = project.sections || {};
    project.enabledSections[key] = Boolean(enabled);
    if (enabled && !project.sections[key]) {
      project.sections[key] = normalizeSection(key, undefined);
    } else if (!enabled) {
      delete project.sections[key];
    }
  };

  const loadProjectState = async () => {
    await loadCustomSections();
    try {
      const result = await apiFetch('project_state');
      if (result.data && result.data.projects && Object.keys(result.data.projects).length > 0) {
        return normalizeState(result.data);
      }
    } catch (error) {
      console.error('❌ FastAPI state load error:', error.message);
    }

    let parsed = null;
    try {
      const raw = global.localStorage && global.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        parsed = JSON.parse(raw);
      }
    } catch (error) {
      // ignore browser storage errors
    }

    if (!parsed && memoryFallback) {
      try {
        parsed = JSON.parse(memoryFallback);
      } catch (fallbackError) {
        parsed = null;
      }
    }

    if (!parsed) {
      return createDefaultState();
    }

    return normalizeState(parsed);
  };

  const persistProjectState = async (state) => {
    const payload = JSON.stringify(state);
    memoryFallback = payload;

    // Visitors who are not logged in (e.g. the public homepage) can switch projects,
    // but the server only accepts saves with an API key or session token, so keep it local.
    const hasCredentials = Boolean(getApiKey() || getSessionToken());
    if (hasCredentials) {
      try {
        await apiFetch('project_state', {
          method: 'POST',
          body: payload,
        });
      } catch (error) {
        console.error('❌ FastAPI state save error:', error.message);
        // 401 = not authorised to save (e.g. expired session): saved locally, no need to alarm the user
        if (error.status !== 401) {
          alert('Warning: Failed to save to server. Data saved locally only.\n\nError: ' + error.message);
        }
      }
    }

    try {
      if (global.localStorage) {
        global.localStorage.setItem(STORAGE_KEY, payload);
      }
    } catch (error) {
      console.error('❌ localStorage save error:', error);
    }
  };

  const getSectionPercent = (section) => {
    if (!section || !Array.isArray(section.items) || section.items.length === 0) {
      return 0;
    }
    const trackedItems = section.items.filter((item) => item.tracked !== false);
    if (!trackedItems.length) {
      return 0;
    }
    const total = trackedItems.reduce((sum, item) =>
      sum + clamp(Number(item.percent) || 0, 0, 100), 0);
    return Math.round(total / trackedItems.length);
  };

  const getActiveProject = (state) => state.projects[state.activeProjectId];

  const setActiveProject = (state, projectId) => {
    if (state.projects[projectId]) {
      state.activeProjectId = projectId;
    }
    return getActiveProject(state);
  };

  const addProject = (state, title, templateProject, includedSections, extra = {}) => {
    const project = cloneProject(templateProject, title, true, includedSections, extra);
    state.projects[project.id] = project;
    state.activeProjectId = project.id;
    return project;
  };

  const listProjects = (state) => Object.values(state.projects).sort((a, b) => a.title.localeCompare(b.title));

  const removeProject = (state, projectId) => {
    if (!state || !state.projects || !state.projects[projectId]) {
      return false;
    }
    delete state.projects[projectId];

    const remainingIds = Object.keys(state.projects);
    if (!remainingIds.length) {
      const fallback = createProject();
      state.projects[fallback.id] = fallback;
      state.activeProjectId = fallback.id;
      return true;
    }

    if (state.activeProjectId === projectId) {
      state.activeProjectId = remainingIds[0];
    }
    return true;
  };

  const getEnabledSections = (project) => {
    if (!project || !project.enabledSections) {
      return [...SECTION_ORDER];
    }
    return SECTION_ORDER.filter((key) => project.enabledSections[key] !== false);
  };

  const isSectionEnabled = (project, key) => {
    if (!project || !project.enabledSections || typeof project.enabledSections[key] === 'undefined') {
      return true;
    }
    return project.enabledSections[key] !== false;
  };

  const isProjectCompleted = (project) => {
    if (!project) {
      return false;
    }
    if (project.status === 'completed') {
      return true;
    }
    if (project.status && project.status !== 'completed') {
      return false;
    }
    const activeKeys = getEnabledSections(project);
    if (!activeKeys.length) {
      return false;
    }
    return activeKeys.every((key) => {
      const section = project.sections ? project.sections[key] : null;
      return section && getSectionPercent(section) >= 100;
    });
  };

  const getActiveUserName = () => {
    try {
      const sessionValue = global.sessionStorage && global.sessionStorage.getItem(ACTIVE_USER_KEY);
      if (sessionValue) { return sessionValue; }
      const localValue = global.localStorage && global.localStorage.getItem(ACTIVE_USER_KEY);
      if (localValue) { return localValue; }
    } catch (error) {
      // ignore storage errors
    }
    return 'Admin';
  };

  const touchProject = (project, options = {}) => {
    project.lastUpdate = new Date().toISOString();
    project.lastUpdatedBy = getActiveUserName();
    if (!options.preserveStatus) {
      const activeKeys = getEnabledSections(project);
      if (
        activeKeys.length > 0 &&
        activeKeys.every((key) => {
          const section = project.sections ? project.sections[key] : null;
          return section && getSectionPercent(section) >= 100;
        })
      ) {
        project.status = 'completed';
      }
    }
  };

  const LOGS_KEY = 'projectDashboardUpdateLogs';

  const loadUpdateLogs = async () => {
    try {
      const result = await apiFetch('update_logs');
      if (result.data) {
        return Array.isArray(result.data) ? result.data : Object.values(result.data);
      }
    } catch (error) {
      console.error('Logs load error:', error);
    }

    try {
      const raw = global.localStorage && global.localStorage.getItem(LOGS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  };

  const appendUpdateLog = (entry) => {
    const persistLog = async (locationData) => {
      const logEntry = {
        ...entry,
        timestamp: new Date().toISOString(),
        location: locationData || null
      };

      try {
        await apiFetch('update_logs', {
          method: 'POST',
          body: JSON.stringify(logEntry),
        });
      } catch (error) {
        console.error('❌ Log save error:', error.message);
      }

      try {
        const raw = global.localStorage && global.localStorage.getItem(LOGS_KEY);
        const logs = raw ? JSON.parse(raw) : [];
        logs.push(logEntry);
        global.localStorage && global.localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
      } catch (error) {
        // ignore persistence issues
      }
    };

    const nav = global.navigator;
    try {
      if (nav && nav.geolocation && typeof nav.geolocation.getCurrentPosition === 'function') {
        nav.geolocation.getCurrentPosition(
          (position) => {
            const coords = position && position.coords;
            if (!coords) {
              persistLog(null);
              return;
            }
            persistLog({
              latitude: typeof coords.latitude === 'number' ? coords.latitude : null,
              longitude: typeof coords.longitude === 'number' ? coords.longitude : null,
              accuracy: typeof coords.accuracy === 'number' ? coords.accuracy : null
            });
          },
          () => persistLog(null),
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
        return;
      }
    } catch (error) {
      // fall back to logging without coordinates
    }

    persistLog(null);
  };

  global.ProjectData = {
    SECTION_ORDER,
    SECTION_DEFS,
    BUILTIN_SECTION_ORDER,
    CUSTOM_SECTION_PALETTE,
    isCustomSection,
    getSectionColor,
    getSectionDisplayName,
    loadCustomSections,
    listCustomSections,
    createCustomSection,
    updateCustomSection,
    deleteCustomSection,
    setSectionEnabledForProject,
    STORAGE_KEY,
    AUTH_KEY,
    API_KEY_STORAGE,
    SESSION_TOKEN_KEY,
    USER_ROLE_KEY,
    USER_PROFILE_KEY,
    ACTIVE_USER_KEY,
    WELCOME_KEY,
    clamp,
    fmtDate,
    statusClass,
    loadProjectState,
    persistProjectState,
    getSectionPercent,
    getActiveProject,
    setActiveProject,
    addProject,
    listProjects,
    touchProject,
    loadUpdateLogs,
    appendUpdateLog,
    getActiveUserName,
    getCurrentUser,
    getUserRole,
    isAdmin,
    setAuthSession,
    getSessionToken,
    createProject,
    cloneProject,
    getEnabledSections,
    isSectionEnabled,
    isProjectCompleted,
    setEnabledSections,
    removeProject,
    getApiKey,
    isAuthenticated,
    logout,
    apiFetch,
    showToast,
    openChangePasswordModal,
  };
})(window);
