export type Product = {
  id: number
  name: string
  category: string
  price: number
  rating: number
  image: string
  images: string[]
  description: string
  features: string[]
  stock: number
}

export const products: Product[] = [
  {
    id: 1,
    name: 'NovaBook Pro 14',
    category: 'Laptops',
    price: 1299,
    rating: 4.8,
    image: 'https://picsum.photos/seed/laptop-novabook/800/500',
    images: [
      'https://picsum.photos/seed/laptop-novabook/800/500',
      'https://picsum.photos/seed/laptop-novabook-side/800/500',
      'https://picsum.photos/seed/laptop-novabook-work/800/500',
    ],
    description:
      'A premium 14-inch laptop built for multitasking, sharp visuals, and all-day productivity.',
    features: ['14” 2.8K display', '16 GB RAM', '512 GB SSD', 'Up to 14 hours battery'],
    stock: 12,
  },
  {
    id: 2,
    name: 'Pulse X Smartphone',
    category: 'Phones',
    price: 899,
    rating: 4.7,
    image: 'https://picsum.photos/seed/phone-pulsex/800/500',
    images: [
      'https://picsum.photos/seed/phone-pulsex/800/500',
      'https://picsum.photos/seed/phone-pulsex-back/800/500',
      'https://picsum.photos/seed/phone-pulsex-hand/800/500',
    ],
    description:
      'A fast flagship phone with a vivid camera system, smooth scrolling, and reliable battery life.',
    features: ['6.7” OLED screen', 'Triple-lens camera', '5G ready', 'Fast wireless charging'],
    stock: 18,
  },
  {
    id: 3,
    name: 'CloudTab Air',
    category: 'Tablets',
    price: 549,
    rating: 4.5,
    image: 'https://picsum.photos/seed/tablet-cloudtab/800/500',
    images: [
      'https://picsum.photos/seed/tablet-cloudtab/800/500',
      'https://picsum.photos/seed/tablet-cloudtab-pen/800/500',
      'https://picsum.photos/seed/tablet-cloudtab-desk/800/500',
    ],
    description:
      'Lightweight and portable, ideal for note taking, streaming, and work on the go.',
    features: ['11” display', 'Stylus support', '128 GB storage', 'Slim aluminum body'],
    stock: 20,
  },
  {
    id: 4,
    name: 'EchoPods Max',
    category: 'Headphones',
    price: 299,
    rating: 4.6,
    image: 'https://picsum.photos/seed/headphones-echopods/800/500',
    images: [
      'https://picsum.photos/seed/headphones-echopods/800/500',
      'https://picsum.photos/seed/headphones-echopods-case/800/500',
      'https://picsum.photos/seed/headphones-echopods-desk/800/500',
    ],
    description:
      'Noise-canceling headphones tuned for immersive sound, comfort, and crystal-clear calls.',
    features: ['Active noise canceling', '40-hour battery', 'Premium cushions', 'Bluetooth multipoint'],
    stock: 9,
  },
  {
    id: 5,
    name: 'Falcon RGB Keyboard',
    category: 'Gaming',
    price: 149,
    rating: 4.4,
    image: 'https://picsum.photos/seed/gaming-falcon/800/500',
    images: [
      'https://picsum.photos/seed/gaming-falcon/800/500',
      'https://picsum.photos/seed/gaming-falcon-close/800/500',
      'https://picsum.photos/seed/gaming-falcon-setup/800/500',
    ],
    description:
      'Responsive mechanical switches with customizable RGB lighting for gaming and productivity.',
    features: ['Mechanical switches', 'Per-key RGB', 'USB-C cable', 'Compact layout'],
    stock: 15,
  },
  {
    id: 6,
    name: 'Orbit Docking Hub',
    category: 'Accessories',
    price: 99,
    rating: 4.3,
    image: 'https://picsum.photos/seed/accessories-orbit/800/500',
    images: [
      'https://picsum.photos/seed/accessories-orbit/800/500',
      'https://picsum.photos/seed/accessories-orbit-ports/800/500',
      'https://picsum.photos/seed/accessories-orbit-office/800/500',
    ],
    description:
      'Expand your workspace with extra ports, fast data transfer, and compact desk-friendly design.',
    features: ['HDMI output', 'USB-C PD passthrough', 'SD card reader', 'Aluminum finish'],
    stock: 26,
  },
  {
    id: 7,
    name: 'Vertex Ultra Monitor',
    category: 'Gaming',
    price: 479,
    rating: 4.7,
    image: 'https://picsum.photos/seed/monitor-vertex/800/500',
    images: [
      'https://picsum.photos/seed/monitor-vertex/800/500',
      'https://picsum.photos/seed/monitor-vertex-side/800/500',
      'https://picsum.photos/seed/monitor-vertex-setup/800/500',
    ],
    description:
      'A vibrant monitor designed for smooth gameplay, creative work, and immersive viewing.',
    features: ['27” QHD panel', '165 Hz refresh rate', '1 ms response time', 'Adjustable stand'],
    stock: 7,
  },
  {
    id: 8,
    name: 'SnapCharge 3-in-1',
    category: 'Accessories',
    price: 79,
    rating: 4.5,
    image: 'https://picsum.photos/seed/charger-snapcharge/800/500',
    images: [
      'https://picsum.photos/seed/charger-snapcharge/800/500',
      'https://picsum.photos/seed/charger-snapcharge-night/800/500',
      'https://picsum.photos/seed/charger-snapcharge-desk/800/500',
    ],
    description:
      'Charge your phone, earbuds, and watch in one clean setup with quick wireless charging.',
    features: ['3-device support', 'Fast charging pad', 'Travel-friendly design', 'LED status light'],
    stock: 30,
  },
]
