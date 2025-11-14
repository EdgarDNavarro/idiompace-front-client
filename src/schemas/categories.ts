export interface Voice {
    id: string;
    name: string;
    accent: string;
    gender: string;
}


export const CATEGORIES_ENGLISH = [
    "Children", "Educational", "Science", "Fiction", "Conversation", "Work", "Travel", "Food",
    "Programming", "Health", "Business", "Technology", "University", "School", "Home", "Sports",
    "Human body", "Animals", "Nature", "Numbers", "Past continuous", "Present simple",
    "Future going to", "Present perfect", "Past perfect", "Reported speech", "Passive voice",
    "Future will", "Present continuous", "Past simple", "Conditional 0", "Modals", "Phrasal verbs", 
    "Conditional 1", "Conditional 2", "Conditional 3", "Conditional mixed"
];


export const CATEGORIES_SPANISH = [
    "Infantil", "Educativo", "Ciencia", "Ficción", "Conversación", "Trabajo", "Viajes", "Comida",
    "Programación", "Salud", "Negocios", "Tecnología", "Universidad", "Escuela", "Hogar", "Deportes",
    "Cuerpo humano", "Animales", "Naturaleza", "Números", "Pasado continuo", "Presente simple",
    "Futuro ir a", "Presente perfecto", "Pasado perfecto", "Estilo indirecto", "Voz pasiva",
    "Futuro", "Presente continuo", "Pasado simple", "Condicionales", "Modales", "Verbos compuestos"
];

export const spanishVoices: Voice[] = [
    { id: "Nh2zY9kknu6z4pZy6FhD", name: "David Martin", accent: "Spanish", gender: "Male" },
    { id: "452WrNT9o8dphaYW5YGU", name: "Abel Lz", accent: "Standard", gender: "Male" },
    { id: "k8cFOyAg7B9qwBlDDNTC", name: "Miguel", accent: "Standard", gender: "Male" },
    { id: "x5IDPSl4ZUbhosMmVFTk", name: "Lumina", accent: "Colombian", gender: "Female" },
    { id: "AxFLn9byyiDbMn5fmyqu", name: "Aitana", accent: "Peninsular", gender: "Female" }
];

export const englishVoices: Voice[] = [
    { id: "452WrNT9o8dphaYW5YGU", name: "Abel Lz", accent: "British", gender: "Male" },
    { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", accent: "British", gender: "Male" },
    { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica", accent: "American", gender: "Female" },
    { id: "k8cFOyAg7B9qwBlDDNTC", name: "Miguel", accent: "American", gender: "Male" },
    { id: "iEBOK9alpKauGRvBSsFi", name: "Heisenberg", accent: "American", gender: "Male" },
    { id: "MFZUKuGQUsGJPQjTS4wC", name: "Jon", accent: "American", gender: "Male" },
    { id: "2qfp6zPuviqeCOZIE9RZ", name: "Trinity", accent: "American", gender: "Female" },
];