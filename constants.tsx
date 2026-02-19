
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
      backgroundVideo: "https://assets.mixkit.co/videos/preview/mixkit-abstract-motion-of-vibrant-colors-40076-large.mp4",
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
      backgroundVideo: "https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-lines-and-dots-in-blue-9122-large.mp4",
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
      backgroundVideo: "https://assets.mixkit.co/videos/preview/mixkit-abstract-motion-of-vibrant-colors-40076-large.mp4",
      themeColor: "#00E676",
      content: {
        title: "RECENT BANGERS",
        items: [
          { 
            id: "p1", 
            title: "Cyberpunk 2077 Edit", 
            category: "Commercial", 
            thumbnail: "https://picsum.photos/seed/edit1/800/450",
            videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-urban-traffic-in-the-city-at-night-4402-large.mp4"
          },
          { 
            id: "p2", 
            title: "Urban Rhythms", 
            category: "Music Video", 
            thumbnail: "https://picsum.photos/seed/edit2/800/450",
            videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-slow-motion-of-a-glittery-purple-fabric-spinning-around-40118-large.mp4"
          },
          { 
            id: "p3", 
            title: "Nature's Echo", 
            category: "Documentary", 
            thumbnail: "https://picsum.photos/seed/edit3/800/450",
            videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-stars-in-the-night-sky-out-of-focus-9126-large.mp4"
          }
        ]
      }
    },
    {
      id: "about-1",
      type: "about",
      order: 3,
      isVisible: true,
      backgroundVideo: "https://assets.mixkit.co/videos/preview/mixkit-stars-in-the-night-sky-out-of-focus-9126-large.mp4",
      themeColor: "#00C853",
      content: {
        title: "BEHIND THE SCREEN",
        description: "With 8+ years of cutting through the noise, I specialize in high-energy edits that keep viewers glued to their screens. My toolkit includes Premiere, After Effects, and a massive supply of coffee.",
        imageUrl: "https://picsum.photos/seed/editor/600/600"
      }
    },
    {
      id: "contact-1",
      type: "contact",
      order: 4,
      isVisible: true,
      backgroundVideo: "https://assets.mixkit.co/videos/preview/mixkit-waves-of-colored-particles-in-the-air-out-of-focus-9114-large.mp4",
      themeColor: "#00E676",
      content: {
        title: "LET'S COLLAB",
        description: "Ready to take your content to the next level? Drop me a line and let's discuss your vision.",
        email: "hello@vividmotion.com",
        socials: [
          { platform: "Instagram", url: "#" },
          { platform: "YouTube", url: "#" }
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
