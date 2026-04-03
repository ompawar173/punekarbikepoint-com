import { Bike } from "lucide-react";

export interface BikeListingData {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  kmDriven: number;
  fuelType: string;
  image: string;
  location: string;
  owner: string;
  description: string;
  condition: string;
}

export const BRANDS = [
  "Honda", "Yamaha", "Royal Enfield", "Bajaj", "TVS",
  "Suzuki", "KTM", "Hero", "Kawasaki", "BMW",
];

export const BIKE_LISTINGS: BikeListingData[] = [
  {
    id: "1",
    title: "Royal Enfield Classic 350",
    brand: "Royal Enfield",
    model: "Classic 350",
    year: 2022,
    price: 165000,
    kmDriven: 8500,
    fuelType: "Petrol",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=400&fit=crop",
    location: "Pune",
    owner: "1st Owner",
    description: "Well maintained Royal Enfield Classic 350 in excellent condition. Regular servicing done at authorized service center.",
    condition: "Excellent",
  },
  {
    id: "2",
    title: "Yamaha R15 V4",
    brand: "Yamaha",
    model: "R15 V4",
    year: 2023,
    price: 155000,
    kmDriven: 3200,
    fuelType: "Petrol",
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&h=400&fit=crop",
    location: "Mumbai",
    owner: "1st Owner",
    description: "Almost new Yamaha R15 V4 with all original accessories. No scratches or dents.",
    condition: "Like New",
  },
  {
    id: "3",
    title: "Honda CB350",
    brand: "Honda",
    model: "CB350",
    year: 2021,
    price: 140000,
    kmDriven: 15000,
    fuelType: "Petrol",
    image: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600&h=400&fit=crop",
    location: "Delhi",
    owner: "2nd Owner",
    description: "Honda CB350 in good condition. Comfortable ride for daily commute and long trips.",
    condition: "Good",
  },
  {
    id: "4",
    title: "KTM Duke 200",
    brand: "KTM",
    model: "Duke 200",
    year: 2022,
    price: 145000,
    kmDriven: 12000,
    fuelType: "Petrol",
    image: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=600&h=400&fit=crop",
    location: "Bengaluru",
    owner: "1st Owner",
    description: "KTM Duke 200 in great shape. Perfect for city riding with powerful performance.",
    condition: "Good",
  },
  {
    id: "5",
    title: "Bajaj Pulsar NS200",
    brand: "Bajaj",
    model: "Pulsar NS200",
    year: 2021,
    price: 95000,
    kmDriven: 22000,
    fuelType: "Petrol",
    image: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=600&h=400&fit=crop",
    location: "Hyderabad",
    owner: "2nd Owner",
    description: "Bajaj Pulsar NS200, great value for money. Well maintained with all documents up to date.",
    condition: "Good",
  },
  {
    id: "6",
    title: "TVS Apache RTR 160",
    brand: "TVS",
    model: "Apache RTR 160",
    year: 2023,
    price: 105000,
    kmDriven: 5000,
    fuelType: "Petrol",
    image: "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=600&h=400&fit=crop",
    location: "Chennai",
    owner: "1st Owner",
    description: "TVS Apache RTR 160 4V with SmartXonnect. Low mileage, perfect condition.",
    condition: "Excellent",
  },
  {
    id: "7",
    title: "Suzuki Gixxer 250",
    brand: "Suzuki",
    model: "Gixxer 250",
    year: 2022,
    price: 135000,
    kmDriven: 10000,
    fuelType: "Petrol",
    image: "https://images.unsplash.com/photo-1547549082-6bc09f2049ae?w=600&h=400&fit=crop",
    location: "Jaipur",
    owner: "1st Owner",
    description: "Suzuki Gixxer 250 in mint condition. Oil cooled engine, smooth ride.",
    condition: "Excellent",
  },
  {
    id: "8",
    title: "Hero Xpulse 200",
    brand: "Hero",
    model: "Xpulse 200",
    year: 2023,
    price: 120000,
    kmDriven: 7000,
    fuelType: "Petrol",
    image: "https://images.unsplash.com/photo-1622185135505-2d795003994a?w=600&h=400&fit=crop",
    location: "Kolkata",
    owner: "1st Owner",
    description: "Hero Xpulse 200 adventure bike. Great for off-road and on-road both.",
    condition: "Excellent",
  },
];
