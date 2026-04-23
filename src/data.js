// Generate dummy candidate data
const colleges = [
  "MIT", "Stanford", "Harvard", "Caltech", "Princeton", "Yale", "Columbia", "UChicago", "UPenn", "Northwestern",
  "Duke", "Johns Hopkins", "Penn State", "Cornell", "Carnegie Mellon", "UCLA", "UC Berkeley", "USC", "Georgia Tech", "UIUC"
];

const names = [
  "Alice Johnson", "Bob Smith", "Charlie Brown", "Diana Prince", "Eve Adams", "Frank Miller", "Grace Lee", "Henry Wilson",
  "Ivy Chen", "Jack Davis", "Kate Taylor", "Liam Garcia", "Mia Rodriguez", "Noah Martinez", "Olivia Lopez", "Parker Anderson",
  "Quinn Thompson", "Ryan White", "Sophia Harris", "Tyler Clark", "Uma Patel", "Victor Lewis", "Wendy Hall", "Xander Young",
  "Yara Khan", "Zoe Nguyen", "Aaron Carter", "Bella Evans", "Caleb Foster", "Delilah Brooks", "Ethan Reed", "Fiona Gray",
  "Gavin Hughes", "Hannah Russell", "Isaac Simmons", "Jasmine Flores", "Kevin Sanders", "Luna Bennett", "Mason Price",
  "Nora Coleman", "Owen Barnes", "Piper Murphy", "Quincy Hayes", "Riley Cooper", "Sadie Rivera", "Tucker Morgan",
  "Violet Bailey", "Wyatt Nelson", "Ximena Ramirez", "Yusuf Torres", "Zara Peterson", "Adrian Wood", "Beatrice Long",
  "Cameron Ross", "Daisy Ward", "Elliot Turner", "Faith Collins", "Gabriel Stewart", "Hailey Morris", "Ian Rogers",
  "Julia Kelly", "Kai Butler", "Leah Simmons", "Miles Perry", "Nina Powell", "Oscar Jenkins", "Peyton Cox", "Quentin Ward",
  "Ruby Fisher", "Sawyer Myers", "Tessa Hunter", "Uriah Hicks", "Violet Lawson", "Wyatt Jensen", "Xanthe Ford", "Yosef Burke",
  "Zayden Casey", "Amelia Stone", "Benjamin Shaw", "Chloe Warren", "Daniel Fields", "Elena Lane", "Felix Bryant", "Gabriella Nichols",
  "Hudson Webb", "Isabella Holmes", "Julian Fletcher", "Kendra Wallace", "Logan Armstrong", "Madeline Greene", "Nathaniel Vaughn",
  "Ophelia Bates", "Preston Lambert", "Raegan Henderson", "Sebastian Quinn", "Thea Crawford", "Ulysses Dunn", "Vivianne Pierce",
  "Weston Sutton", "Xiomara Ingram", "Yahir McKenzie", "Zinnia Castro"
];

function generateRandomScore(min = 50, max = 100) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const candidates = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: names[i % names.length],
  college: colleges[Math.floor(Math.random() * colleges.length)],
  assignment_score: generateRandomScore(),
  video_score: generateRandomScore(),
  ats_score: generateRandomScore(),
  github_score: generateRandomScore(),
  communication_score: generateRandomScore(),
  reviewed: false,
  shortlisted: false,
  assignment_ratings: {
    ui_clarity: 0,
    component_structure: 0,
    state_handling: 0,
    priority_logic: 0,
    edge_case_handling: 0,
    visual_hierarchy: 0
  },
  video_ratings: {
    clarity: 0,
    confidence: 0,
    architecture_explanation: 0,
    tradeoff_reasoning: 0,
    communication: 0
  },
  video_notes: []
}));