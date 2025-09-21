import type { PromptState } from '../types';

// We only want to define partial state for templates, omitting user-specific fields.
type Template = Partial<Pick<PromptState, 'camera' | 'audio' | 'videoQuality' | 'aspectRatio' | 'visualStyle'>>;

export const TEMPLATES: Record<string, Template> = {
  "Trailer Sinematik": {
    camera: {
      style: "Cinematic",
      movement: "Dolly (Kamera bergerak maju/mundur)",
      angle: "Low-angle (Dari bawah, subjek tampak kuat/dominan)",
      focus: "Rack focus",
      lighting: "Low-key (Kontras tinggi, banyak bayangan, dramatis)",
      colorGrading: "Bleach Bypass",
    },
    audio: {
      dialogueType: "Narasi",
      dialogueTone: "Mendalam, serius",
      dialogues: [{ id: '1', speaker: 'Narator', content: 'Di dunia yang dilanda kegelapan, satu harapan akan bangkit.', language: 'Indonesia' }],
      mood: "Epik",
      ambientSound: "Suara dentuman samar",
      backgroundMusic: "Musik orkestra epik dengan crescendo",
    },
    videoQuality: "4K, Realistis",
    aspectRatio: "16:9 (Lanskap)",
  },
  "Adegan Aksi": {
    camera: {
      style: "Cinematic",
      movement: "Handheld (Kamera dipegang tangan, goyangan alami)",
      angle: "Dutch angle (Kamera miring, menciptakan ketegangan)",
      focus: "Shallow focus",
      lighting: "Studio light (Pencahayaan terkontrol di studio)",
      colorGrading: "Vibrant",
    },
    audio: {
      dialogueType: "Dialog",
      dialogueTone: "Cepat, tegang",
      dialogues: [
        { id: '1', speaker: 'Karakter 1', content: 'Kita harus pergi dari sini, sekarang!', language: 'Indonesia' },
        { id: '2', speaker: 'Karakter 2', content: 'Aku di belakangmu!', language: 'Indonesia' }
      ],
      mood: "Tegang",
      ambientSound: "Ledakan, tembakan, teriakan",
      backgroundMusic: "Musik elektronik tempo cepat",
    },
    videoQuality: "HD, Jernih",
    aspectRatio: "16:9 (Lanskap)",
  },
  "Vlog Santai": {
    camera: {
      style: "Documentary",
      movement: "Static (Kamera diam, tidak bergerak)",
      angle: "Eye-level (Sejajar mata subjek, netral)",
      focus: "Deep focus",
      lighting: "Natural light (Cahaya alami dari matahari)",
      colorGrading: "Muted",
    },
    audio: {
      dialogueType: "Monolog",
      dialogueTone: "Ramah, santai",
      dialogues: [{ id: '1', speaker: 'Vlogger', content: 'Hai semuanya, selamat datang kembali di channelku! Hari ini kita akan...', language: 'Indonesia' }],
      mood: "Tenang",
      ambientSound: "Kicauan burung, angin sepoi-sepoi",
      backgroundMusic: "Musik lo-fi akustik lembut",
    },
    videoQuality: "HD",
    aspectRatio: "16:9 (Lanskap)",
  },
    "Video Musik Anime": {
    visualStyle: "Anime",
    camera: {
      style: "Anime",
      movement: "Pan (Kamera bergerak horizontal kiri/kanan)",
      angle: "High-angle (Dari atas, subjek tampak kecil/rentan)",
      focus: "Soft focus",
      lighting: "Backlight (Cahaya dari belakang subjek, menciptakan siluet)",
      colorGrading: "Technicolor",
    },
    audio: {
      dialogueType: "Tanpa Dialog",
      dialogueTone: "",
      dialogues: [],
      mood: "Senang",
      ambientSound: "",
      backgroundMusic: "J-Pop atau J-Rock tempo cepat",
    },
    videoQuality: "HD, Anime Style",
    aspectRatio: "16:9 (Lanskap)",
  },
  "Film Komedi": {
    camera: {
      style: "Cinematic",
      movement: "Static (Kamera diam, tidak bergerak)",
      angle: "Eye-level (Sejajar mata subjek, netral)",
      focus: "Deep focus",
      lighting: "High-key (Terang, minim bayangan, ceria)",
      colorGrading: "Vibrant",
    },
    audio: {
      dialogueType: "Dialog",
      dialogueTone: "Cepat, lucu, ironis",
      dialogues: [
        { id: '1', speaker: 'Karakter 1', content: 'Bukan begitu caranya membuat kopi!', language: 'Indonesia' },
        { id: '2', speaker: 'Karakter 2', content: 'Oh ya? Memangnya kenapa?', language: 'Indonesia' }
      ],
      mood: "Senang",
      ambientSound: "Suara tawa penonton (laugh track)",
      backgroundMusic: "Musik jazz ceria atau musik komedi quirky",
    },
    videoQuality: "HD",
    aspectRatio: "16:9 (Lanskap)",
  },
  "Video Opening": {
    camera: {
      style: "Cinematic",
      movement: "Crane (Kamera bergerak naik/turun secara signifikan)",
      angle: "Bird's-eye view (Tepat dari atas, seperti mata burung)",
      focus: "Deep focus",
      lighting: "Golden hour (Cahaya hangat saat matahari terbit/terbenam)",
      colorGrading: "Vibrant",
    },
    audio: {
      dialogueType: "Tanpa Dialog",
      dialogueTone: "",
      dialogues: [],
      mood: "Epik",
      ambientSound: "",
      backgroundMusic: "Lagu tema utama yang megah dan membangun antusiasme",
    },
    videoQuality: "4K",
    aspectRatio: "16:9 (Lanskap)",
  },
  "Situasi Komedi": {
    camera: {
      style: "Cinematic",
      movement: "Static (Kamera diam, tidak bergerak)",
      angle: "Eye-level (Sejajar mata subjek, netral)",
      focus: "Deep focus",
      lighting: "Studio light (Pencahayaan terkontrol di studio)",
      colorGrading: "Vibrant",
    },
    audio: {
      dialogueType: "Dialog",
      dialogueTone: "Cerdas, penuh punchline",
      dialogues: [{ id: '1', speaker: 'Komedian', content: 'Kamu yakin itu ide yang bagus? Terakhir kali kamu bilang begitu, kita berakhir dengan seekor llama di apartemen.', language: 'Indonesia' }],
      mood: "Senang",
      ambientSound: "Suara tawa penonton (laugh track)",
      backgroundMusic: "Musik transisi singkat dan ceria",
    },
    videoQuality: "HD",
    aspectRatio: "16:9 (Lanskap)",
  },
  "Film Drama": {
    camera: {
      style: "Cinematic",
      movement: "Steadicam (Gerakan kamera halus mengikuti subjek)",
      angle: "Eye-level (Sejajar mata subjek, netral)",
      focus: "Shallow focus",
      lighting: "Low-key (Kontras tinggi, banyak bayangan, dramatis)",
      colorGrading: "Muted",
    },
    audio: {
      dialogueType: "Dialog",
      dialogueTone: "Serius, emosional, mendalam",
      dialogues: [{ id: '1', speaker: 'Protagonis', content: 'Aku tidak tahu harus berkata apa lagi. Semuanya sudah berbeda sekarang.', language: 'Indonesia' }],
      mood: "Sedih",
      ambientSound: "Hujan di jendela, detak jam",
      backgroundMusic: "Melodi piano lembut dan melankolis",
    },
    videoQuality: "4K, Realistis",
    aspectRatio: "16:9 (Lanskap)",
  },
  "Film Kartun": {
    visualStyle: "Cartoon 3D",
    camera: {
      style: "Anime",
      movement: "Zoom (Lensa mendekat/menjauh dari subjek)",
      angle: "Eye-level (Sejajar mata subjek, netral)",
      focus: "Deep focus",
      lighting: "High-key (Terang, minim bayangan, ceria)",
      colorGrading: "Vibrant",
    },
    audio: {
      dialogueType: "Dialog",
      dialogueTone: "Berlebihan, energik",
      dialogues: [{ id: '1', speaker: 'Karakter A', content: 'Awas! Di belakangmu ada pisang raksasa!', language: 'Indonesia' }],
      mood: "Senang",
      ambientSound: "Efek suara kartun (boing, zap, bonk)",
      backgroundMusic: "Musik orkestra yang ceria dan dinamis",
    },
    videoQuality: "HD, Cartoon Style",
    aspectRatio: "16:9 (Lanskap)",
  },
  "Film Sci-Fi": {
    camera: {
      style: "Sci-Fi",
      movement: "Dolly (Kamera bergerak maju/mundur)",
      angle: "Low-angle (Dari bawah, subjek tampak kuat/dominan)",
      focus: "Deep focus",
      lighting: "Backlight (Cahaya dari belakang subjek, menciptakan siluet)",
      colorGrading: "Bleach Bypass",
    },
    audio: {
      dialogueType: "Dialog",
      dialogueTone: "Teknis, misterius",
      dialogues: [{ id: '1', speaker: 'Kapten', content: 'Sistem navigasi tidak merespon. Kita tersesat di sektor Gamma-7.', language: 'Indonesia' }],
      mood: "Misterius",
      ambientSound: "Dengungan mesin kapal, bunyi bip komputer",
      backgroundMusic: "Musik synthesizer atmosferik dan menegangkan",
    },
    videoQuality: "4K, Jernih",
    aspectRatio: "16:9 (Lanskap)",
  },
};

export const TEMPLATE_OPTIONS = [
    "", 
    "Trailer Sinematik", 
    "Adegan Aksi", 
    "Vlog Santai", 
    "Video Musik Anime",
    "Film Komedi",
    "Video Opening",
    "Situasi Komedi",
    "Film Drama",
    "Film Kartun",
    "Film Sci-Fi"
];
