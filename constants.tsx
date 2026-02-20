
import { SiteConfig } from './types';

export const DEFAULT_CONFIG: SiteConfig = {
  siteName: "VIVID MOTION",
  logo: "🎬",
  primaryColor: "#00E676", // Vibrant Green
  secondaryColor: "#00C853", // Forest Green
  adminPasscode: "edit123",
  sections: [
    {
      id: "hero-1",
      type: "hero",
      order: 0,
      isVisible: true,
      backgroundVideo: "https://cdn.pixabay.com/video/2020/09/24/50812-462820684_large.mp4",
      themeColor: "#00E676",
      content: {
        title: "I BRING PIXELS TO LIFE",
        subtitle: "Professional Video Editor & Motion Designer",
        description: "Transforming raw footage into cinematic stories that captivate and inspire. Let's make something loud together.",
        buttons: [
          { text: "View Projects", link: "#projects-1", variant: "primary", visible: true },
          { text: "Get in Touch", link: "#contact-1", variant: "outline", visible: true }
        ]
      }
    },
    {
      id: "intro-1",
      type: "intro",
      order: 1,
      isVisible: true,
      backgroundVideo: "https://cdn.pixabay.com/video/2023/10/20/185834-876615024_large.mp4",
      themeColor: "#00C853",
      content: {
        title: "HEY, I'M ALEX",
        description: "I've been staring at timelines since 2015. I don't just cut clips; I build rhythms. If you need energy, you're in the right place.",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop"
      }
    },
    {
      id: "projects-1",
      type: "projects",
      order: 2,
      isVisible: true,
      backgroundVideo: "https://cdn.pixabay.com/video/2021/09/10/88075-603173708_large.mp4",
      themeColor: "#00E676",
      content: {
        title: "SELECTED BANGERS",
        description: "High-octane edits and cinematic stories that move the needle.",
        items: [
          { 
            id: "p1", 
            title: "Cyberpunk Visions", 
            category: "Commercial", 
            thumbnail: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?q=80&w=1200&auto=format&fit=crop",
            videoUrl: "https://www.youtube.com/watch?v=q6f-JUz17U4" 
          },
          { 
            id: "p2", 
            title: "Nature's Rhythm", 
            category: "Motion Graphics", 
            thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop",
            videoUrl: "https://www.youtube.com/watch?v=668nUCeB73A" 
          },
          { 
            id: "p3", 
            title: "Abstract Flow", 
            category: "Visual Arts", 
            thumbnail: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop",
            videoUrl: "https://www.youtube.com/watch?v=z9Y7H_B4D-I"
          },
          { 
            id: "p4", 
            title: "Urban Pulse", 
            category: "Street", 
            thumbnail: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1200&auto=format&fit=crop",
            videoUrl: "https://www.youtube.com/watch?v=5qap5aO4i9A"
          }
        ]
      }
    },
    {
      id: "about-1",
      type: "about",
      order: 3,
      isVisible: true,
      backgroundVideo: "https://cdn.pixabay.com/video/2020/05/25/40133-425145324_large.mp4",
      themeColor: "#00C853",
      content: {
        title: "BEHIND THE SCREEN",
        description: "With 8+ years of cutting through the noise, I specialize in high-energy edits that keep viewers glued to their screens. My toolkit includes Premiere, After Effects, and a massive supply of coffee.",
        imageUrl: "https://images.unsplash.com/photo-1539351014930-411832bad42e?q=80&w=800&auto=format&fit=crop"
      }
    },
    {
      id: "contact-1",
      type: "contact",
      order: 4,
      isVisible: true,
      backgroundVideo: "https://cdn.pixabay.com/video/2022/01/18/104624-666355609_large.mp4",
      themeColor: "#00E676",
      content: {
        title: "LET'S COLLAB",
        description: "Ready to take your content to the next level? Drop me a line and let's discuss your vision.",
        email: "hello@vividmotion.com",
        socials: [
          { platform: "Instagram", url: "https://instagram.com" },
          { platform: "YouTube", url: "https://youtube.com" },
          { platform: "X", url: "https://x.com" }
        ]
      }
    }
  ]
};

export const SECTION_TYPES = [
  { value: 'hero', label: 'Hero Section' },
  { value: 'intro', label: 'Intro Section' },
  { value: 'projects', label: 'Project Gallery' },
  { value: 'about', label: 'About Me' },
  { value: 'contact', label: 'Contact Info' }
];
