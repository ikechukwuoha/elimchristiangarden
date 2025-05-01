// types/index.ts
export interface Announcement {
    id: number;
    title: string;
    description: string;
    date: string;
    image?: string;
    link?: string;
  }
  
  export interface Preacher {
    id: number;
    name: string;
    image: string;
    title: string;
  }
  
  export interface Sermon {
    id: number;
    title: string;
    description: string;
    date: string;
    audioUrl: string;
    thumbnail: string;
    preacher: Preacher;
    series?: string;
    popular?: boolean;
    bibleReferences: string
    
  }