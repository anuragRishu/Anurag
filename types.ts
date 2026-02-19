
export type SectionType = 'hero' | 'intro' | 'projects' | 'about' | 'contact' | 'testimonials' | 'stats';

export interface ButtonConfig {
  text: string;
  link: string;
  variant: 'primary' | 'secondary' | 'outline';
  visible: boolean;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  videoUrl?: string;
}

export interface SectionContent {
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  items?: any[]; // Can be ProjectItem[] or other lists
  buttons?: ButtonConfig[];
  email?: string;
  socials?: SocialLink[];
}

export interface Section {
  id: string;
  type: SectionType;
  order: number;
  isVisible: boolean;
  backgroundVideo: string;
  themeColor: string;
  content: SectionContent;
}

export interface SiteConfig {
  siteName: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  adminPasscode: string;
  sections: Section[];
}
