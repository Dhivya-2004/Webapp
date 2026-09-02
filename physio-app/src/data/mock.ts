export type Role = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  avatar?: string;
  specialization?: string; // For doctors
}

export interface Product {
  id: string;
  name: string;
  price: number;
  
  image: string;
  sizes?: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const mockUsers: User[] = [
  { id: 'u1', name: 'Admin User', role: 'admin', email: 'admin@physio.com' },
  { id: 'u2', name: 'Dr. Sarah Jenkins', role: 'doctor', email: 'sarah@physio.com', specialization: 'Orthopedic Physiotherapy' },
  { id: 'u3', name: 'Dr. Mark Sloan', role: 'doctor', email: 'mark@physio.com', specialization: 'Neurological Physiotherapy' },
  { id: 'u4', name: 'John Doe', role: 'patient', email: 'john@example.com' },
];

export const mockProducts: Product[] = [
  { id: 'p1',  name: 'Cervical soft collar',           price: 249,  image: 'https://images.apollo247.in/pub/media/catalog/product/C/E/CER0253_2-JULY23_1.jpg', sizes: ['S', 'M', 'L'] },
  { id: 'p2',  name: 'Shoulder immobilizer',            price: 499,  image: 'https://imgcdn.mckesson.com/CumulusWeb/Images/Item_Detail/1159131_ppkgright.jpg', sizes: ['S', 'M', 'L', 'XL'] },
  { id: 'p3',  name: 'Tennis elbow splint',             price: 229,  image: 'https://jsbhealthcare.co.in/cdn/shop/files/Tennis_Elbow_Support_Brace_for_Golfers_JSB_BS65_medium.jpg?v=1752994142', sizes: ['Normal'] },
  { id: 'p4',  name: 'Immobilizer pouch elbow',         price: 349,  image: 'https://cdn01.pharmeasy.in/dam/products_otc/M80125/besafe-forever-half-arm-sling-pouch-belt-arm-brace-immobilizer-grey-2-1767673500.jpg', sizes: ['S', 'M', 'L'] },
  { id: 'p5',  name: 'Thumbs spica',                    price: 199,  image: 'https://images.apollo247.in/pub/media/catalog/product/T/H/THU0023_5-AUG23_1.jpg?tr=q-80,f-webp,w-400,dpr-3,c-at_max 400w', sizes: ['Normal'] },
  { id: 'p6',  name: 'Buddy splint',                    price: 129,  image: 'https://lookaside.instagram.com/seo/google_widget/crawler/?media_id=3940170854339355397', sizes: ['Normal'] },
  { id: 'p7',  name: 'Cock up splint',                  price: 299,  image: 'https://cdn01.pharmeasy.in/dam/products_otc/P99688/vissco-dynamic-cock-up-splint-with-finger-extension-left-1-1641790492.jpg', sizes: ['S', 'M', 'L'] },
  { id: 'p8',  name: 'Wrist extensor',                  price: 399,  image: 'https://www.ipsprosthetics.com/wp-content/uploads/2021/11/image-20211104-164956-bc465411-scaled.jpeg', sizes: ['S', 'M', 'L'] },
  { id: 'p9',  name: 'Foot wear silicon gel',           price: 449,  image: 'https://onemg.gumlet.io/l_watermark_346,w_480,h_480/a_ignore,w_480,h_480,c_fit,q_auto,f_auto/a7d8a992bca444aa99e4e5df76a9b1ad.jpg?dpr=3&format=auto&w=412', sizes: ['5', '6', '7', '8', '9', '10'] },
  { id: 'p10', name: 'Finger extensor',                 price: 179,  image: 'https://rcai.com/cdn/shop/files/59FEO_1.jpg?v=1756988513&width=1445', sizes: ['Normal'] },
  { id: 'p11', name: 'Lumbosacral belt',                price: 749,  image: 'https://i.ebayimg.com/images/g/RcgAAOSwjG9krjfw/s-l400.jpg', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
  { id: 'p12', name: 'Posture correction belt',         price: 599,  image: 'https://image.made-in-china.com/202f0j00zfdMYkrGvHcU/Adjustable-Elastic-Posture-Corrector-Belt-Neoprene-Upper-Back-Support-for-Improve-Posture.webp', sizes: ['S', 'M', 'L', 'XL'] },
  { id: 'p13', name: 'Pelvic traction kit',             price: 1199, image: 'https://image.made-in-china.com/202f0j00oKslpIqzOYra/Orthopedic-Traction-Table-and-Lumbar-Traction-Device-Table-with-Warm-up-Function-for-Hospital.webp', sizes: ['Normal'] },
  { id: 'p14', name: 'Cervical traction kit',           price: 999,  image: 'https://m.media-amazon.com/images/I/51crIffMsvL._AC_UF1000,1000_QL80_.jpg', sizes: ['Normal'] },
  { id: 'p15', name: 'Hinge knee brace',                price: 1499, image: 'https://cdn01.pharmeasy.in/dam/products_otc/Q92798/flamingo-hinged-knee-cap-support-brace-sleeves-size-xl-6.2-1699000952.jpg?dim=768x585&q=100', sizes: ['S', 'M', 'L', 'XL'] },
  { id: 'p16', name: 'Varus knee brace right and left', price: 1899, image: 'https://cdn.moglix.com/p/0BYsL0ZATeDk9-medium.jpg', sizes: ['S', 'M', 'L'] },
  { id: 'p17', name: 'Anklet',                          price: 199,  image: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/acareindia.com/wp-content/uploads/2022/02/ANKLET-DELUX-A-CARE.jpg', sizes: ['S', 'M', 'L'] },
  { id: 'p18', name: 'Hallux finger splint',            price: 249,  image: 'https://i0.wp.com/aapson.com/wp-content/uploads/2017/07/G003-2.png?resize=300,300&ssl=1', sizes: ['Normal'] },
  { id: 'p19', name: 'Soft foot wear',                  price: 499,  image: 'https://dropinblog.net/cdn-cgi/image/fit=scale-down,width=700/34250199/files/orthopedic-shoes.jpg', sizes: ['5', '6', '7', '8', '9', '10'] },
  { id: 'p20', name: 'Creep bandage hand and leg',      price: 149,  image: 'https://images.meesho.com/images/products/888128373/fz6cr_512.webp?width=512', sizes: ['10cm', '15cm'] },
];

export const mockAppointments: Appointment[] = [
  { id: 'a1', patientId: 'u4', doctorId: 'u2', date: '2026-07-10', time: '10:00 AM', status: 'pending' },
];
