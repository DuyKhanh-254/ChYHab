/* =============================================
   ChYHab — Structured Learning Data
   - 12-word Student & Communication Vocabulary Bank (with Phonemes & SRS)
   - Full 60-Unit CEFR Grammar Curriculum (A1 -> C2) + Mini Tests & Level Tests
   - Shop Catalog, Weekly Stats & University Leaderboards
   ============================================= */

'use strict';

// =============================================
// 1. VOCABULARY BANK (12 WORDS)
// =============================================
window.CHYHAB_VOCAB = [
  {
    id: 'book',
    word: 'book',
    type: 'noun',
    typeVi: 'danh từ',
    ipa: '/bʊk/',
    phonemes: ['b', 'ʊ', 'k'],
    meaning: 'Cuốn sách',
    level: 'A1',
    exampleEn: 'I want to buy a <strong>book</strong> to read tonight.',
    exampleVi: 'Tôi muốn mua một cuốn sách để đọc tối nay.',
    contextBefore: 'I want to buy a ',
    contextAfter: ' to read tonight.',
    distractorsVi: ['Cái bàn', 'Cây bút', 'Cái ghế'],
    distractorsEn: ['chair', 'bottle', 'umbrella']
  },
  {
    id: 'syllabus',
    word: 'syllabus',
    type: 'noun',
    typeVi: 'danh từ',
    ipa: '/ˈsɪl.ə.bəs/',
    phonemes: ['s', 'ɪ', 'l', 'ə', 'b', 'ə', 's'],
    meaning: 'Đề cương môn học',
    level: 'B1',
    exampleEn: 'Please check the course <strong>syllabus</strong> before the midterm exam.',
    exampleVi: 'Hãy xem đề cương môn học trước kỳ thi giữa kỳ.',
    contextBefore: 'Please check the course ',
    contextAfter: ' before the midterm exam.',
    distractorsVi: ['Thư viện', 'Học bổng', 'Bài thuyết trình'],
    distractorsEn: ['library', 'holiday', 'notebook']
  },
  {
    id: 'experience',
    word: 'experience',
    type: 'noun',
    typeVi: 'danh từ',
    ipa: '/ɪkˈspɪə.ri.əns/',
    phonemes: ['ɪ', 'k', 's', 'p', 'ɪə', 'r', 'i', 'ə', 'n', 's'],
    meaning: 'Trải nghiệm, kinh nghiệm',
    level: 'B1',
    exampleEn: 'Volunteering gave me valuable <strong>experience</strong> for my CV.',
    exampleVi: 'Hoạt động tình nguyện mang lại cho tôi kinh nghiệm quý giá cho CV.',
    contextBefore: 'Volunteering gave me valuable ',
    contextAfter: ' for my CV.',
    distractorsVi: ['Thí nghiệm', 'Mục tiêu', 'Kế hoạch'],
    distractorsEn: ['experiment', 'schedule', 'homework']
  },
  {
    id: 'curriculum',
    word: 'curriculum',
    type: 'noun',
    typeVi: 'danh từ',
    ipa: '/kəˈrɪk.jə.ləm/',
    phonemes: ['k', 'ə', 'r', 'ɪ', 'k', 'j', 'ə', 'l', 'ə', 'm'],
    meaning: 'Chương trình giảng dạy',
    level: 'B2',
    exampleEn: 'The university updated its English <strong>curriculum</strong> this semester.',
    exampleVi: 'Trường đại học đã cập nhật chương trình tiếng Anh học kỳ này.',
    contextBefore: 'The university updated its English ',
    contextAfter: ' this semester.',
    distractorsVi: ['Bằng tốt nghiệp', 'Ký túc xá', 'Giảng đường'],
    distractorsEn: ['diploma', 'dormitory', 'cafeteria']
  },
  {
    id: 'presentation',
    word: 'presentation',
    type: 'noun',
    typeVi: 'danh từ',
    ipa: '/ˌprez.ənˈteɪ.ʃən/',
    phonemes: ['p', 'r', 'e', 'z', 'ə', 'n', 't', 'eɪ', 'ʃ', 'ə', 'n'],
    meaning: 'Bài thuyết trình',
    level: 'B1',
    exampleEn: 'Our group rehearsed the <strong>presentation</strong> twice last night.',
    exampleVi: 'Nhóm mình đã tập dượt bài thuyết trình hai lần tối qua.',
    contextBefore: 'Our group rehearsed the ',
    contextAfter: ' twice last night.',
    distractorsVi: ['Bài kiểm tra', 'Cuộc phỏng vấn', 'Bản báo cáo'],
    distractorsEn: ['vacation', 'magazine', 'dictionary']
  },
  {
    id: 'deadline',
    word: 'deadline',
    type: 'noun',
    typeVi: 'danh từ',
    ipa: '/ˈded.laɪn/',
    phonemes: ['d', 'e', 'd', 'l', 'aɪ', 'n'],
    meaning: 'Hạn chót nộp bài',
    level: 'B1',
    exampleEn: 'We must submit the assignment before the Friday <strong>deadline</strong>.',
    exampleVi: 'Chúng ta phải nộp bài tập trước hạn chót thứ Sáu.',
    contextBefore: 'We must submit the assignment before the Friday ',
    contextAfter: '.',
    distractorsVi: ['Lịch học', 'Điểm tổng kết', 'Giờ giải lao'],
    distractorsEn: ['headline', 'timetable', 'classroom']
  },
  {
    id: 'scholarship',
    word: 'scholarship',
    type: 'noun',
    typeVi: 'danh từ',
    ipa: '/ˈskɒl.ə.ʃɪp/',
    phonemes: ['s', 'k', 'ɒ', 'l', 'ə', 'ʃ', 'ɪ', 'p'],
    meaning: 'Học bổng',
    level: 'B1',
    exampleEn: 'She won a full <strong>scholarship</strong> to study abroad.',
    exampleVi: 'Cô ấy đã giành được học bổng toàn phần để du học.',
    contextBefore: 'She won a full ',
    contextAfter: ' to study abroad.',
    distractorsVi: ['Học phí', 'Chứng chỉ', 'Thực tập'],
    distractorsEn: ['tuition', 'internship', 'membership']
  },
  {
    id: 'collaborate',
    word: 'collaborate',
    type: 'verb',
    typeVi: 'động từ',
    ipa: '/kəˈlæb.ə.reɪt/',
    phonemes: ['k', 'ə', 'l', 'æ', 'b', 'ə', 'r', 'eɪ', 't'],
    meaning: 'Hợp tác, làm việc nhóm',
    level: 'B2',
    exampleEn: 'Students <strong>collaborate</strong> online to finish their capstone project.',
    exampleVi: 'Sinh viên hợp tác trực tuyến để hoàn thành đồ án tốt nghiệp.',
    contextBefore: 'Students ',
    contextAfter: ' online to finish their capstone project.',
    distractorsVi: ['Tranh luận', 'Cạnh tranh', 'Ghi chép'],
    distractorsEn: ['celebrate', 'hesitate', 'translate']
  },
  {
    id: 'research',
    word: 'research',
    type: 'noun',
    typeVi: 'danh từ',
    ipa: '/rɪˈsɜːtʃ/',
    phonemes: ['r', 'ɪ', 's', 'ɜː', 'tʃ'],
    meaning: 'Nghiên cứu khoa học',
    level: 'B1',
    exampleEn: 'Good academic writing requires thorough <strong>research</strong>.',
    exampleVi: 'Viết học thuật tốt đòi hỏi sự nghiên cứu kỹ lưỡng.',
    contextBefore: 'Good academic writing requires thorough ',
    contextAfter: '.',
    distractorsVi: ['Giải trí', 'Thảo luận', 'Ôn tập'],
    distractorsEn: ['rehearsal', 'receipt', 'resource']
  },
  {
    id: 'feedback',
    word: 'feedback',
    type: 'noun',
    typeVi: 'danh từ',
    ipa: '/ˈfiːd.bæk/',
    phonemes: ['f', 'iː', 'd', 'b', 'æ', 'k'],
    meaning: 'Phản hồi, nhận xét',
    level: 'B1',
    exampleEn: 'The lecturer gave helpful <strong>feedback</strong> on my essay.',
    exampleVi: 'Giảng viên đã đưa ra nhận xét hữu ích cho bài luận của tôi.',
    contextBefore: 'The lecturer gave helpful ',
    contextAfter: ' on my essay.',
    distractorsVi: ['Điểm danh', 'Bài giảng', 'Tài liệu'],
    distractorsEn: ['backpack', 'flashback', 'playback']
  },
  {
    id: 'achievement',
    word: 'achievement',
    type: 'noun',
    typeVi: 'danh từ',
    ipa: '/əˈtʃiːv.mənt/',
    phonemes: ['ə', 'tʃ', 'iː', 'v', 'm', 'ə', 'n', 't'],
    meaning: 'Thành tựu, thành tích',
    level: 'B2',
    exampleEn: 'Reaching B2 English is a proud <strong>achievement</strong>.',
    exampleVi: 'Đạt chuẩn tiếng Anh B2 là một thành tựu đáng tự hào.',
    contextBefore: 'Reaching B2 English is a proud ',
    contextAfter: '.',
    distractorsVi: ['Thử thách', 'Kỷ niệm', 'Nhiệm vụ'],
    distractorsEn: ['assignment', 'agreement', 'apartment']
  },
  {
    id: 'assignment',
    word: 'assignment',
    type: 'noun',
    typeVi: 'danh từ',
    ipa: '/əˈsaɪn.mənt/',
    phonemes: ['ə', 's', 'aɪ', 'n', 'm', 'ə', 'n', 't'],
    meaning: 'Bài tập lớn / Nhiệm vụ',
    level: 'B1',
    exampleEn: 'I finished my English <strong>assignment</strong> two hours early.',
    exampleVi: 'Tôi đã hoàn thành bài tập tiếng Anh sớm hơn hai tiếng.',
    contextBefore: 'I finished my English ',
    contextAfter: ' two hours early.',
    distractorsVi: ['Giáo trình', 'Chữ ký', 'Kỳ nghỉ'],
    distractorsEn: ['equipment', 'argument', 'document']
  }
];

// =============================================
// 2. FULL 60-UNIT GRAMMAR CURRICULUM (A1 -> C2)
// =============================================
window.CHYHAB_GRAMMAR_SECTIONS = [
  {
    id: 'A',
    cefr: 'A1',
    badge: 'A. BEGINNER',
    title: 'Basic Grammar',
    subtitle: 'Nền tảng từ loại & cấu trúc cơ bản (Units 1–10)',
    color: '#22C55E',
    items: [
      { id: 'u1', type: 'unit', num: 1, title: 'Noun', vi: 'Danh từ' },
      { id: 'u2', type: 'unit', num: 2, title: 'Pronoun', vi: 'Đại từ' },
      { id: 'u3', type: 'unit', num: 3, title: 'Verb', vi: 'Động từ' },
      { id: 'mt-a1', type: 'minitest', title: 'Mini Test A1 (Units 1–3)', vi: 'Kiểm tra nhanh Danh từ – Đại từ – Động từ' },
      { id: 'u4', type: 'unit', num: 4, title: 'Adjective', vi: 'Tính từ' },
      { id: 'u5', type: 'unit', num: 5, title: 'Adverb', vi: 'Trạng từ' },
      { id: 'u6', type: 'unit', num: 6, title: 'Preposition', vi: 'Giới từ' },
      { id: 'mt-a2', type: 'minitest', title: 'Mini Test A2 (Units 4–6)', vi: 'Kiểm tra nhanh Tính từ – Trạng từ – Giới từ' },
      { id: 'u7', type: 'unit', num: 7, title: 'Conjunction', vi: 'Liên từ' },
      { id: 'u8', type: 'unit', num: 8, title: 'Articles', vi: 'Mạo từ (a, an, the)' },
      { id: 'u9', type: 'unit', num: 9, title: 'Singular & Plural Nouns', vi: 'Danh từ số ít & số nhiều' },
      { id: 'u10', type: 'unit', num: 10, title: 'Possessives', vi: 'Sở hữu cách & Tính từ sở hữu' },
      { id: 'test-a', type: 'test', title: 'Level A Test (Units 1–10)', vi: 'Bài kiểm tra tổng hợp Beginner' }
    ]
  },
  {
    id: 'B',
    cefr: 'A2',
    badge: 'B. ELEMENTARY',
    title: 'Basic Tenses & Sentence Structures',
    subtitle: 'Các thì cơ bản & mẫu câu thiết yếu (Units 11–24)',
    color: '#3B82F6',
    items: [
      { id: 'u11', type: 'unit', num: 11, title: 'Present Simple Tense', vi: 'Thì Hiện tại đơn' },
      { id: 'u12', type: 'unit', num: 12, title: 'Adverbs of Frequency', vi: 'Trạng từ chỉ tần suất' },
      { id: 'u13', type: 'unit', num: 13, title: 'There Is & There Are', vi: 'Cấu trúc There is / There are' },
      { id: 'u14', type: 'unit', num: 14, title: 'Some & Any', vi: 'Lượng từ Some & Any' },
      { id: 'u15', type: 'unit', num: 15, title: 'Present Continuous Tense', vi: 'Thì Hiện tại tiếp diễn' },
      { id: 'u16', type: 'unit', num: 16, title: 'Prepositions of Time & Place', vi: 'Giới từ chỉ thời gian & nơi chốn' },
      { id: 'u17', type: 'unit', num: 17, title: 'Past Simple Tense', vi: 'Thì Quá khứ đơn' },
      { id: 'u18', type: 'unit', num: 18, title: 'Much & Many', vi: 'Lượng từ Much & Many' },
      { id: 'u19', type: 'unit', num: 19, title: 'Comparatives', vi: 'So sánh hơn' },
      { id: 'u20', type: 'unit', num: 20, title: 'Superlatives', vi: 'So sánh nhất' },
      { id: 'u21', type: 'unit', num: 21, title: 'Past Continuous Tense', vi: 'Thì Quá khứ tiếp diễn' },
      { id: 'u22', type: 'unit', num: 22, title: 'Future Simple Tense (Will)', vi: 'Thì Tương lai đơn (Will)' },
      { id: 'u23', type: 'unit', num: 23, title: 'Be Going To (Future Plans & Predictions)', vi: 'Tương lai gần (Be going to)' },
      { id: 'u24', type: 'unit', num: 24, title: 'Present Continuous for Future Arrangements', vi: 'Hiện tại tiếp diễn chỉ kế hoạch tương lai' },
      { id: 'test-b', type: 'test', title: 'Level B Test (Units 11–24)', vi: 'Bài kiểm tra tổng hợp Elementary' }
    ]
  },
  {
    id: 'C',
    cefr: 'B1',
    badge: 'C. PRE-INTERMEDIATE',
    title: 'Expanding Sentences',
    subtitle: 'Mở rộng câu phức & câu điều kiện (Units 25–31)',
    color: '#F97316',
    items: [
      { id: 'u25', type: 'unit', num: 25, title: 'Modal Verbs (Can, Could, Should, Must, Have To & Might)', vi: 'Động từ khuyết thiếu' },
      { id: 'u26', type: 'unit', num: 26, title: 'Gerunds (Verb + -ing)', vi: 'Danh động từ (V-ing)' },
      { id: 'u27', type: 'unit', num: 27, title: 'Infinitives (To + Verb)', vi: 'Động từ nguyên mẫu (To-V)' },
      { id: 'u28', type: 'unit', num: 28, title: 'Relative Clauses', vi: 'Mệnh đề quan hệ' },
      { id: 'u29', type: 'unit', num: 29, title: 'Linking Words & Conjunctions', vi: 'Từ nối & Liên từ mở rộng' },
      { id: 'u30', type: 'unit', num: 30, title: 'Zero Conditional', vi: 'Câu điều kiện loại 0' },
      { id: 'u31', type: 'unit', num: 31, title: 'First Conditional', vi: 'Câu điều kiện loại 1' },
      { id: 'test-c', type: 'test', title: 'Level C Test (Units 25–31)', vi: 'Bài kiểm tra tổng hợp Pre-Intermediate' }
    ]
  },
  {
    id: 'D',
    cefr: 'B1+',
    badge: 'D. INTERMEDIATE',
    title: 'Perfect Tenses & Complex Grammar',
    subtitle: 'Các thì hoàn thành, bị động & gián tiếp (Units 32–38)',
    color: '#8B5CF6',
    items: [
      { id: 'u32', type: 'unit', num: 32, title: 'Present Perfect Tense', vi: 'Thì Hiện tại hoàn thành' },
      { id: 'u33', type: 'unit', num: 33, title: 'Used To (Past Habits & States)', vi: 'Cấu trúc Used to' },
      { id: 'u34', type: 'unit', num: 34, title: 'Passive Voice', vi: 'Câu bị động' },
      { id: 'u35', type: 'unit', num: 35, title: 'Past Perfect Tense', vi: 'Thì Quá khứ hoàn thành' },
      { id: 'u36', type: 'unit', num: 36, title: 'Reported Speech', vi: 'Câu tường thuật gián tiếp' },
      { id: 'u37', type: 'unit', num: 37, title: 'Second Conditional', vi: 'Câu điều kiện loại 2' },
      { id: 'u38', type: 'unit', num: 38, title: 'Future Perfect Tense', vi: 'Thì Tương lai hoàn thành' },
      { id: 'test-d', type: 'test', title: 'Level D Test (Units 32–38)', vi: 'Bài kiểm tra tổng hợp Intermediate' }
    ]
  },
  {
    id: 'E',
    cefr: 'B2',
    badge: 'E. UPPER-INTERMEDIATE',
    title: 'Perfect Continuous Tenses & Advanced Structures',
    subtitle: 'Hoàn thành tiếp diễn & cấu trúc nâng cao (Units 39–46)',
    color: '#EC4899',
    items: [
      { id: 'u39', type: 'unit', num: 39, title: 'Present Perfect Continuous Tense', vi: 'Thì Hiện tại hoàn thành tiếp diễn' },
      { id: 'u40', type: 'unit', num: 40, title: 'Advanced Modal Verbs (Modal Perfects)', vi: 'Động từ khuyết thiếu hoàn thành' },
      { id: 'u41', type: 'unit', num: 41, title: 'Future Continuous Tense', vi: 'Thì Tương lai tiếp diễn' },
      { id: 'u42', type: 'unit', num: 42, title: 'Causative Structures (Have/Get Something Done)', vi: 'Thể sai khiến (Have/Get sth done)' },
      { id: 'u43', type: 'unit', num: 43, title: 'Past Perfect Continuous Tense', vi: 'Thì Quá khứ hoàn thành tiếp diễn' },
      { id: 'u44', type: 'unit', num: 44, title: 'Third Conditional', vi: 'Câu điều kiện loại 3' },
      { id: 'u45', type: 'unit', num: 45, title: 'Mixed Conditionals', vi: 'Câu điều kiện hỗn hợp' },
      { id: 'u46', type: 'unit', num: 46, title: 'Future Perfect Continuous Tense', vi: 'Thì Tương lai hoàn thành tiếp diễn' },
      { id: 'test-e', type: 'test', title: 'Level E Test (Units 39–46)', vi: 'Bài kiểm tra tổng hợp Upper-Intermediate' }
    ]
  },
  {
    id: 'F',
    cefr: 'C1–C2',
    badge: 'F. ADVANCED',
    title: 'Precision, Style & Nuance',
    subtitle: 'Ngữ pháp học thuật, văn phong & sắc thái (Units 47–60)',
    color: '#0EA5E9',
    items: [
      { id: 'u47', type: 'unit', num: 47, title: 'Complex Noun Phrases', vi: 'Cụm danh từ phức tạp' },
      { id: 'u48', type: 'unit', num: 48, title: 'Advanced Article Use', vi: 'Cách dùng mạo từ nâng cao' },
      { id: 'u49', type: 'unit', num: 49, title: 'Nominalisation', vi: 'Danh từ hóa trong văn học thuật' },
      { id: 'u50', type: 'unit', num: 50, title: 'Participle Clauses', vi: 'Mệnh đề phân từ' },
      { id: 'u51', type: 'unit', num: 51, title: 'Reduced Relative Clauses', vi: 'Rút gọn mệnh đề quan hệ' },
      { id: 'u52', type: 'unit', num: 52, title: 'Ellipsis & Substitution', vi: 'Tỉnh lược & Thay thế' },
      { id: 'u53', type: 'unit', num: 53, title: 'Cleft Sentences', vi: 'Câu chẻ nhấn mạnh' },
      { id: 'u54', type: 'unit', num: 54, title: 'Inversion', vi: 'Đảo ngữ' },
      { id: 'u55', type: 'unit', num: 55, title: 'Conditional Inversion', vi: 'Đảo ngữ câu điều kiện' },
      { id: 'u56', type: 'unit', num: 56, title: 'Subjunctive Mood', vi: 'Thức giả định' },
      { id: 'u57', type: 'unit', num: 57, title: 'Hedging Language', vi: 'Ngôn ngữ rào đón học thuật' },
      { id: 'u58', type: 'unit', num: 58, title: 'Advanced Linking Words', vi: 'Từ nối học thuật nâng cao' },
      { id: 'u59', type: 'unit', num: 59, title: 'Advanced Discourse Markers', vi: 'Dấu hiệu diễn ngôn nâng cao' },
      { id: 'u60', type: 'unit', num: 60, title: 'Formal vs. Informal Grammar', vi: 'Ngữ pháp trang trọng & thân mật' },
      { id: 'test-f', type: 'test', title: 'Level F Mastery Test (Units 47–60)', vi: 'Bài kiểm tra tổng hợp Advanced C1–C2' }
    ]
  }
];

// Detailed handcrafted lesson content for flagship units + smart generator for all 60 units
window.CHYHAB_GRAMMAR_LESSONS = {
  u1: {
    formula: 'Countable (a book, two books) | Uncountable (information, advice, water)',
    usage: 'Danh từ gọi tên người, vật, địa điểm hoặc khái niệm. Trong tiếng Anh học thuật, cần phân biệt danh từ đếm được và không đếm được để chia động từ chính xác.',
    examples: [
      { en: 'The university library has thousands of books.', vi: 'Thư viện trường đại học có hàng nghìn cuốn sách.' },
      { en: 'She gave me useful advice before the exam.', vi: 'Cô ấy cho tôi lời khuyên hữu ích trước kỳ thi.' }
    ],
    mistake: '❌ "many advices / an information" → ✅ "much advice / a piece of information" (advice & information là danh từ không đếm được).',
    quiz: [
      { q: 'Which sentence is grammatically correct?', options: ['She gave me many good advices.', 'She gave me some good advice.', 'She gave me an advice.', 'She gave me a few advices.'], correct: 1, explain: '"Advice" là danh từ không đếm được, không thêm -s và không dùng "a/an".' },
      { q: 'Identify the abstract noun in: "Success requires discipline."', options: ['requires', 'Success', 'the', 'very'], correct: 1, explain: '"Success" (thành công) là danh từ trừu tượng.' },
      { q: 'We need more ___ for our group research.', options: ['informations', 'an information', 'information', 'inform'], correct: 2, explain: '"Information" không đếm được nên giữ nguyên dạng số ít.' }
    ]
  },
  u11: {
    formula: 'S + V(s/es) | Phủ định: S + do/does not + V | Nghi vấn: Do/Does + S + V?',
    usage: 'Dùng diễn tả thói quen hằng ngày, sự thật hiển nhiên và lịch trình cố định (lịch học, giờ tàu xe). Dấu hiệu: always, usually, often, every day.',
    examples: [
      { en: 'He often reads a book in the library after class.', vi: 'Cậu ấy thường đọc sách ở thư viện sau giờ học.' },
      { en: 'The English class starts at 7:30 a.m. every Monday.', vi: 'Lớp tiếng Anh bắt đầu lúc 7:30 sáng thứ Hai hàng tuần.' }
    ],
    mistake: '❌ "He often read book." → ✅ "He often reads a book." (Quên thêm -s/-es cho chủ ngữ ngôi 3 số ít: He/She/It).',
    quiz: [
      { q: 'He often ___ a book before going to bed.', options: ['read', 'reads', 'reading', 'is read'], correct: 1, explain: 'Chủ ngữ "He" (ngôi 3 số ít) + trạng từ "often" → động từ thêm -s: "reads".' },
      { q: '___ your sister study at this university?', options: ['Do', 'Is', 'Does', 'Are'], correct: 2, explain: 'Câu hỏi thì hiện tại đơn với động từ thường "study" và chủ ngữ số ít "your sister" dùng trợ động từ "Does".' },
      { q: 'Water ___ at 100 degrees Celsius.', options: ['boil', 'boils', 'boiling', 'boiled'], correct: 1, explain: 'Sự thật hiển nhiên dùng Hiện tại đơn; "Water" không đếm được nên chia số ít "boils".' }
    ]
  },
  u15: {
    formula: 'S + am / is / are + V-ing',
    usage: 'Diễn tả hành động đang xảy ra ngay lúc nói (now, at the moment, right now) hoặc xu hướng tạm thời trong hiện tại.',
    examples: [
      { en: 'I am preparing my slides for tomorrow’s presentation.', vi: 'Mình đang chuẩn bị slide cho bài thuyết trình ngày mai.' },
      { en: 'Look! The lecturer is explaining the key formula.', vi: 'Nhìn kìa! Giảng viên đang giải thích công thức trọng tâm.' }
    ],
    mistake: '❌ "I am knowing the answer." → ✅ "I know the answer." (Động từ trạng thái như know, believe, want, like không chia tiếp diễn).',
    quiz: [
      { q: 'Right now, Minh ___ for his B2 speaking test.', options: ['practices', 'is practicing', 'practiced', 'practice'], correct: 1, explain: '"Right now" là dấu hiệu hành động đang diễn ra → dùng Hiện tại tiếp diễn "is practicing".' },
      { q: 'Which sentence is INCORRECT?', options: ['She is reading a syllabus.', 'They are studying in Room 302.', 'I am wanting a coffee now.', 'We are working on the project.'], correct: 2, explain: '"Want" là động từ trạng thái (stative verb), không dùng ở thì tiếp diễn.' },
      { q: 'Be quiet! The students ___ a listening exam.', options: ['take', 'takes', 'are taking', 'took'], correct: 2, explain: 'Câu mệnh lệnh "Be quiet!" báo hiệu sự việc đang diễn ra ngay lúc nói.' }
    ]
  },
  u17: {
    formula: 'S + V2 / V-ed | Phủ định: S + did not + V | Nghi vấn: Did + S + V?',
    usage: 'Diễn tả hành động đã xảy ra và kết thúc hoàn toàn trong quá khứ (yesterday, last week, in 2024, ago).',
    examples: [
      { en: 'I had an interesting experience when I visited Hanoi last summer.', vi: 'Tôi đã có một trải nghiệm thú vị khi đến thăm Hà Nội mùa hè năm ngoái.' },
      { en: 'Did you submit the assignment yesterday?', vi: 'Bạn đã nộp bài tập hôm qua chưa?' }
    ],
    mistake: '❌ "Did you went to class?" → ✅ "Did you go to class?" (Sau "did/didn’t", động từ phải trở về nguyên mẫu).',
    quiz: [
      { q: 'I ___ an unforgettable experience when I visited Da Nang last year.', options: ['have', 'had', 'has', 'having'], correct: 1, explain: '"Last year" chỉ thời điểm đã kết thúc trong quá khứ → dùng Quá khứ đơn "had".' },
      { q: 'She didn’t ___ the deadline because her laptop crashed.', options: ['met', 'meets', 'meet', 'meeting'], correct: 2, explain: 'Sau "didn’t", động từ chia nguyên mẫu không "to": "meet".' },
      { q: 'Where ___ you go for your internship last semester?', options: ['do', 'did', 'were', 'was'], correct: 1, explain: 'Câu hỏi Quá khứ đơn với động từ thường "go" dùng trợ động từ "did".' }
    ]
  },
  u31: {
    formula: 'If + S + V (Present Simple), S + will / can / may + V',
    usage: 'Diễn tả một điều kiện có thể xảy ra ở hiện tại hoặc tương lai và kết quả tất yếu hoặc có khả năng cao xảy ra.',
    examples: [
      { en: 'If you review 10 words every day, you will pass the B1 exam easily.', vi: 'Nếu bạn ôn 10 từ mỗi ngày, bạn sẽ vượt qua kỳ thi B1 dễ dàng.' },
      { en: 'We will miss the deadline if we don’t start tonight.', vi: 'Chúng ta sẽ trễ hạn nếu không bắt đầu tối nay.' }
    ],
    mistake: '❌ "If it will rain, I will stay home." → ✅ "If it rains, I will stay home." (Không dùng "will" trong mệnh đề If loại 1).',
    quiz: [
      { q: 'If you ___ your syllabus early, you will feel more confident.', options: ['review', 'will review', 'reviewed', 'reviewing'], correct: 0, explain: 'Mệnh đề If của Câu điều kiện loại 1 luôn chia Hiện tại đơn.' },
      { q: 'She ___ get the scholarship if her GPA stays above 3.6.', options: ['would', 'will', 'did', 'was'], correct: 1, explain: 'Mệnh đề chính loại 1 dùng will/can/may + V nguyên mẫu.' },
      { q: 'If he doesn’t hurry, he ___ the campus bus.', options: ['misses', 'missed', 'will miss', 'would miss'], correct: 2, explain: 'Kết quả có thể xảy ra ở tương lai dùng "will miss".' }
    ]
  },
  u32: {
    formula: 'S + have / has + V3 / V-ed',
    usage: 'Diễn tả hành động bắt đầu trong quá khứ kéo dài tới hiện tại (since/for), trải nghiệm (ever/never), hoặc hành động vừa xảy ra để lại kết quả ở hiện tại (just/already/yet).',
    examples: [
      { en: 'I have studied English for six years.', vi: 'Tôi đã học tiếng Anh được 6 năm rồi.' },
      { en: 'She has already finished 12 grammar units this week.', vi: 'Cô ấy đã hoàn thành 12 bài ngữ pháp trong tuần này rồi.' }
    ],
    mistake: '❌ "I have visited Hue last year." → ✅ "I visited Hue last year." (Không dùng Hiện tại hoàn thành với mốc thời gian quá khứ xác định như last year, yesterday).',
    quiz: [
      { q: 'Giang ___ 1,240 English words since she joined ChYHab.', options: ['learned', 'has learned', 'learns', 'is learning'], correct: 1, explain: '"Since + mốc quá khứ" đi với thì Hiện tại hoàn thành "has learned".' },
      { q: 'Have you finished the group report ___?', options: ['already', 'just', 'yet', 'since'], correct: 2, explain: '"Yet" dùng ở cuối câu hỏi và câu phủ định thì Hiện tại hoàn thành.' },
      { q: 'They have collaborated on this project ___ three months.', options: ['since', 'for', 'ago', 'in'], correct: 1, explain: '"For + khoảng thời gian" (three months), còn "since + mốc thời gian".' }
    ]
  },
  u34: {
    formula: 'S + be (chia theo thì) + V3 / V-ed (+ by O)',
    usage: 'Nhấn mạnh đối tượng chịu tác động của hành động, cực kỳ phổ biến trong báo cáo nghiên cứu và viết học thuật (Academic Writing).',
    examples: [
      { en: 'The final exam results will be announced next Monday.', vi: 'Kết quả thi cuối kỳ sẽ được công bố vào thứ Hai tới.' },
      { en: 'This study plan was generated by AI.', vi: 'Lộ trình học này được tạo tự động bởi AI.' }
    ],
    mistake: '❌ "The essay was write by Nam." → ✅ "The essay was written by Nam." (Luôn dùng phân từ 2 / V3 sau động từ "be").',
    quiz: [
      { q: 'The research paper ___ by three undergraduate students last month.', options: ['wrote', 'was written', 'is written', 'has written'], correct: 1, explain: 'Chủ ngữ "paper" bị viết + mốc "last month" → bị động Quá khứ đơn "was written".' },
      { q: 'All assignments must ___ before 11:59 p.m.', options: ['submit', 'be submitted', 'submitted', 'submitting'], correct: 1, explain: 'Bị động với động từ khuyết thiếu: modal + be + V3.' },
      { q: 'English ___ in over 60 countries around the world.', options: ['speaks', 'spoke', 'is spoken', 'is speaking'], correct: 2, explain: 'Sự thật hiện tại ở thể bị động → "is spoken".' }
    ]
  },
  u54: {
    formula: 'Negative/Restrictive Adverb + Auxiliary + S + V',
    usage: 'Đảo ngữ đưa trạng từ phủ định/giới hạn (Never, Rarely, Seldom, Not only, Little, Hardly...) lên đầu câu để tạo sắc thái nhấn mạnh, trang trọng (chuẩn C1–C2 IELTS/Academic).',
    examples: [
      { en: 'Not only did she master B2 vocabulary, but she also won a scholarship.', vi: 'Cô ấy không chỉ làm chủ từ vựng B2 mà còn giành được học bổng.' },
      { en: 'Rarely have students had access to such personalized AI feedback.', vi: 'Hiếm khi sinh viên được tiếp cận phản hồi AI cá nhân hóa đến vậy.' }
    ],
    mistake: '❌ "Never I have seen such a clear roadmap." → ✅ "Never have I seen such a clear roadmap." (Phải đảo trợ động từ lên trước chủ ngữ).',
    quiz: [
      { q: 'Not only ___ the presentation, but he also answered every question fluently.', options: ['he delivered', 'did he deliver', 'delivered he', 'he did deliver'], correct: 1, explain: 'Sau "Not only" đứng đầu câu, đảo trợ động từ "did" lên trước chủ ngữ "he".' },
      { q: 'Seldom ___ such rapid progress in speaking skills.', options: ['have we witnessed', 'we have witnessed', 'we witnessed', 'did we witnessed'], correct: 0, explain: 'Trạng từ phủ định "Seldom" đầu câu yêu cầu đảo ngữ: have + S + V3.' },
      { q: 'Little ___ that the syllabus had already been updated.', options: ['they knew', 'did they know', 'knew they', 'they did know'], correct: 1, explain: '"Little" mang nghĩa phủ định ở đầu câu → đảo trợ động từ "did they know".' }
    ]
  }
};

window.getGrammarLessonData = function(item) {
  if (window.CHYHAB_GRAMMAR_LESSONS[item.id]) {
    return window.CHYHAB_GRAMMAR_LESSONS[item.id];
  }
  const title = item.title;
  const vi = item.vi || '';
  if (item.type === 'minitest' || item.type === 'test') {
    return {
      formula: 'Tổng hợp kiến thức trọng tâm & Bẫy ngữ pháp thường gặp trong bài thi CEFR',
      usage: `Bài kiểm tra đánh giá nhanh mức độ nắm vững các chủ điểm thuộc ${title}. Hoàn thành đạt từ 2/3 câu đúng để nhận +40 XP và mở khóa huy hiệu chặng.`,
      examples: [
        { en: 'Consistent daily practice builds lasting grammatical accuracy.', vi: 'Luyện tập đều đặn mỗi ngày giúp xây dựng độ chính xác ngữ pháp bền vững.' },
        { en: 'Reviewing your mistakes is the fastest way to level up.', vi: 'Xem lại lỗi sai là cách nhanh nhất để nâng trình độ.' }
      ],
      mistake: '💡 Mẹo thi: Đọc kỹ dấu hiệu thời gian, chủ ngữ số ít/số nhiều và từ loại trước khi chọn đáp án.',
      quiz: [
        { q: `[${title}] Choose the correct sentence:`, options: ['She usually studies in the library after class.', 'She usually study in the library after class.', 'She is usually study in the library.', 'She studying usually in the library.'], correct: 0, explain: 'Chủ ngữ ngôi 3 số ít + "usually" → dùng Hiện tại đơn "studies".' },
        { q: `[${title}] If we ___ enough time, we will review all key units.`, options: ['will have', 'have', 'had', 'having'], correct: 1, explain: 'Mệnh đề điều kiện loại 1 dùng thì Hiện tại đơn "have".' },
        { q: `[${title}] The new course syllabus ___ by the faculty last week.`, options: ['published', 'was published', 'is publishing', 'has publish'], correct: 1, explain: 'Câu bị động quá khứ đơn với "last week" → "was published".' }
      ]
    };
  }
  return {
    formula: `Cấu trúc trọng tâm: ${title} (${vi})`,
    usage: `Unit ${item.num} giúp bạn nắm chắc cách dùng ${vi.toLowerCase()} trong giao tiếp hằng ngày và bài thi đại học (VSTEP, TOEIC, IELTS). Hãy đọc ví dụ song ngữ rồi làm 3 câu trắc nghiệm bên dưới.`,
    examples: [
      { en: `Mastering ${title.toLowerCase()} makes your English sound more natural and precise.`, vi: `Làm chủ ${vi.toLowerCase()} giúp tiếng Anh của bạn tự nhiên và chính xác hơn.` },
      { en: `Students often practice ${title.toLowerCase()} through real academic examples.`, vi: `Sinh viên thường luyện ${vi.toLowerCase()} qua các ví dụ học thuật thực tế.` }
    ],
    mistake: `⚠️ Lưu ý: Khi áp dụng ${vi.toLowerCase()}, luôn kiểm tra sự hòa hợp chủ ngữ – động từ và ngữ cảnh của câu trước khi viết.`,
    quiz: [
      { q: `Which sentence best demonstrates accurate academic English (${title})?`, options: ['Although the deadline was tight, our team delivered a clear presentation.', 'Although the deadline was tight, but our team delivered a clear presentation.', 'Although tight deadline, our team deliver clear presentation.', 'The deadline tight although our team delivered presentation.'], correct: 0, explain: 'Không dùng đồng thời cả "Although" và "but" trong cùng một câu; động từ phải chia đúng thì.' },
      { q: `Choose the grammatically correct completion for Unit ${item.num}:`, options: ['Each student have to submit the assignment.', 'Each student has to submit the assignment.', 'Each students has to submit the assignment.', 'Each student having to submit the assignment.'], correct: 1, explain: '"Each + danh từ số ít" luôn đi với động từ chia ở số ít ("has").' },
      { q: `Select the most natural sentence structure:`, options: ['It is important reviewing vocabulary every day.', 'It is important to review vocabulary every day.', 'It is important review vocabulary every day.', 'It important to review vocabulary every day.'], correct: 1, explain: 'Cấu trúc chuẩn: It is + adj + to-V (It is important to review...).' }
    ]
  };
};

// =============================================
// 3. SHOP CATALOG
// =============================================
window.CHYHAB_SHOP_ITEMS = [
  { id: 'pear_friend', category: 'mascot', name: 'Bạn Lê (Pear Friend)', desc: 'Đồng hành cổ vũ học từ vựng', price: 500, img: 'assets/mascots/pear_friend.png' },
  { id: 'orange_friend', category: 'mascot', name: 'Bạn Cam (Orange Friend)', desc: 'Cổ vũ luyện viết & đặt câu AI', price: 500, img: 'assets/mascots/orange_friend.png' },
  { id: 'streak_shield', category: 'streak', name: 'Khiên bảo vệ Chuỗi', desc: 'Giữ nguyên Streak khi lỡ quên 1 ngày', price: 300, emoji: '🛡️' },
  { id: 'double_xp', category: 'streak', name: 'Nhân đôi XP (30 phút)', desc: 'Tăng tốc leo Bảng xếp hạng lớp', price: 250, emoji: '⚡' },
  { id: 'refill_hearts', category: 'item', name: 'Hồi đầy 3 Tim', desc: 'Tiếp tục làm bài tập không gián đoạn', price: 150, emoji: '❤️' },
  { id: 'water_drop', category: 'item', name: 'Bình nước Khu vườn (x3)', desc: 'Tưới cây giúp Khu vườn nở hoa nhanh', price: 120, emoji: '💧' }
];

// =============================================
// 4. UNIVERSITY LEADERBOARDS (3 SCOPES)
// =============================================
window.CHYHAB_LEADERBOARDS = {
  school: {
    label: 'Trường ĐH của bạn',
    rows: [
      { rank: 1, name: 'Minh Anh (K66 KT)', xp: 1250, av: 'assets/3d_icons/avatar_chy_3d.png?v=10' },
      { rank: 2, name: 'Thu Hà (K65 CNTT)', xp: 1180, av: 'assets/3d_icons/avatar_cat_3d.png?v=10' },
      { rank: 3, name: 'Quang Huy (K66 NNA)', xp: 1050, av: 'assets/3d_icons/avatar_bird_3d.png?v=10' }
    ],
    userRank: 12
  },
  class: {
    label: 'Lớp ENG204',
    rows: [
      { rank: 1, name: 'Gia Bảo (Nhóm 2)', xp: 890, av: 'assets/3d_icons/avatar_bird_3d.png?v=10' },
      { rank: 2, name: 'Khánh Linh (Nhóm 1)', xp: 810, av: 'assets/3d_icons/avatar_cat_3d.png?v=10' },
      { rank: 3, name: 'Bạn · Hương Giang', xp: 720, av: 'assets/3d_icons/avatar_chy_3d.png?v=10', isMe: true }
    ],
    userRank: 3
  },
  global: {
    label: 'Toàn hệ thống',
    rows: [
      { rank: 1, name: 'Đức Mạnh (HUST)', xp: 2450, av: 'assets/3d_icons/avatar_chy_3d.png?v=10' },
      { rank: 2, name: 'Ngọc Mai (FTU)', xp: 2310, av: 'assets/3d_icons/avatar_cat_3d.png?v=10' },
      { rank: 3, name: 'Hoàng Nam (NEU)', xp: 2190, av: 'assets/3d_icons/avatar_bird_3d.png?v=10' }
    ],
    userRank: 48
  }
};

// =============================================
// 5. WEEKLY STUDY TIME DATA (FOR CHART SWITCHER)
// =============================================
window.CHYHAB_WEEKS = [
  { label: '19–25/10/2026', total: 80, days: [10, 15, 10, 20, 15, 10, 0] },
  { label: '26/10–01/11/2026', total: 95, days: [15, 10, 20, 25, 15, 10, 0] },
  { label: '02–08/11/2026', total: 105, days: [5, 15, 25, 60, 0, 0, 0] }
];
