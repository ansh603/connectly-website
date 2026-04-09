// src/data/mockData.js
export const INTERESTS = [
  'Coffee','Cricket','Movies','Clubbing','Networking',
  'Birthday Events','Wedding Functions','Travel','Gym',
  'Gaming','Seminar','Festival Celebrations',
]

export const INDIVIDUALS = [
  { id:1,  name:'Ananya Sharma',  type:'individual', age:24, photo:'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face', price:1200, interests:['Coffee','Networking','Movies'],             location:'Bandra, Mumbai',   city:'Mumbai',     rating:4.8, reviews:34, bio:'Friendly professional who loves meaningful conversations over coffee or at events. Fluent in Hindi and English. Available for coffee meets, networking, and casual outings.', live:true,  availability:'Weekends & Evenings' },
  { id:2,  name:'Rohan Kapoor',   type:'individual', age:28, photo:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face', price:900,  interests:['Cricket','Gym','Gaming'],                  location:'Andheri, Mumbai',  city:'Mumbai',     rating:4.6, reviews:22, bio:'Sports enthusiast and fitness freak. Looking to be your cricket match partner, gym buddy, or gaming companion!',                                                       live:false, availability:'Mornings & Weekends' },
  { id:3,  name:'Priya Mehta',    type:'individual', age:26, photo:'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face', price:1500, interests:['Travel','Seminar','Networking'],            location:'Colaba, Mumbai',   city:'Mumbai',     rating:4.9, reviews:51, bio:'Corporate professional with excellent communication skills. Perfect for networking events, corporate seminars, and city travel.',                                     live:true,  availability:'Flexible' },
  { id:4,  name:'Dev Malhotra',   type:'individual', age:31, photo:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face', price:800,  interests:['Movies','Coffee','Birthday Events'],       location:'Connaught Place, Delhi', city:'Delhi', rating:4.5, reviews:18, bio:'Chill and laid-back person, loves movies and casual outings. Great company for birthday parties and movie nights!',                                                   live:false, availability:'Evenings' },
  { id:5,  name:'Kavya Nair',     type:'individual', age:22, photo:'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&crop=face', price:1100, interests:['Clubbing','Festival Celebrations','Gym'],   location:'Juhu, Mumbai',     city:'Mumbai',     rating:4.7, reviews:29, bio:'Energetic, fun-loving, always up for a good time. Perfect club companion or festival enthusiast.',                                                                  live:true,  availability:'Nights & Weekends' },
  { id:6,  name:'Arjun Patel',    type:'individual', age:29, photo:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', price:1000, interests:['Wedding Functions','Networking','Travel'],  location:'Koramangala, Bangalore', city:'Bangalore', rating:4.4, reviews:15, bio:'Well-dressed, well-mannered professional. Ideal for wedding functions, formal events, and business networking.',                                                   live:false, availability:'Weekends' },
  { id:7,  name:'Sneha Iyer',     type:'individual', age:25, photo:'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face', price:1300, interests:['Movies','Seminar','Coffee'],                location:'Dadar, Mumbai',    city:'Mumbai',     rating:4.7, reviews:31, bio:'Film enthusiast and coffee lover. Great for movie outings, seminars, and intellectual conversations.',                                                             live:true,  availability:'Afternoons & Evenings' },
  { id:8,  name:'Karan Sharma',   type:'individual', age:27, photo:'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop&crop=face', price:950,  interests:['Cricket','Birthday Events','Gaming'],      location:'Banjara Hills, Hyderabad', city:'Hyderabad', rating:4.3, reviews:11, bio:'Sporty and playful. Perfect cricket team filler, birthday party companion, and gaming partner.',                                                                  live:false, availability:'Weekends & Holidays' },
]

export const GROUPS = []

export const BOOKINGS_MADE = [
  { id:301, person:'Ananya Sharma',  photo:'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop&crop=face', date:'10 Mar 2025', time:'5PM – 7PM',  location:'Bandra Starbucks',       purpose:'Coffee and casual conversation',  amount:2400,  status:'confirmed' },
  { id:303, person:'Rohan Kapoor',   photo:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face', date:'8 Mar 2025',  time:'6AM – 8AM',  location:'Powai Lake Run Track',   purpose:'Morning gym run partner',          amount:900,   status:'pending'   },
]

export const BOOKINGS_RECEIVED = [
  { id:401, person:'Akash Verma', photo:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', date:'12 Mar 2025', time:'3PM – 5PM', location:'Juhu Beach',          purpose:'Networking walk',      amount:2400, status:'confirmed' },
  { id:402, person:'Neha Singh',  photo:'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face', date:'2 Mar 2025',  time:'7PM – 9PM', location:'Phoenix Mall',         purpose:'Shopping companion',   amount:2400, status:'completed' },
]

export const TRANSACTIONS = [
  { id:1, type:'credit', desc:'Booking completed – FunSquad Mumbai',           amount:9450,  date:'5 Mar 2025'  },
  { id:2, type:'debit',  desc:'Booking payment – Ananya Sharma',               amount:-2400, date:'8 Mar 2025'  },
  { id:4, type:'debit',  desc:'Withdrawal to Bank – HDFC ****1234',            amount:-8000, date:'28 Feb 2025' },
  { id:5, type:'escrow', desc:'Escrow locked – Rohan Kapoor booking',          amount:-900,  date:'8 Mar 2025'  },
  { id:6, type:'credit', desc:'Booking completed – Neha Singh',                amount:1680,  date:'2 Mar 2025'  },
  { id:8, type:'credit', desc:'Refund – Cancelled booking',                    amount:800,   date:'15 Feb 2025' },
]

export const NOTIFICATIONS = [
  { id:1, text:'Ananya Sharma accepted your booking!',      time:'2h ago', type:'success' },
  { id:2, text:'Payment of ₹9,450 credited to wallet.',     time:'1d ago', type:'payment' },
  { id:4, text:'Your booking request was confirmed.',       time:'3d ago', type:'success' },
  { id:5, text:'Rohan Kapoor sent a booking request.',      time:'4d ago', type:'booking' },
]

export const MOCK_USER = {
  id:'u001', name:'Rahul Verma', photo:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  location:'Bandra, Mumbai', email:'rahul.verma@example.com', mobile:'+91 98765 43210',
  wallet:12450, escrow:900, totalEarned:18290,
  interests:['Coffee','Networking','Movies','Travel'],
  interestIds: [],
  galleryPhotos: [],
  bio:'Friendly professional, loves meaningful conversations at events. Available for coffee meets, networking, and corporate events.',
  hourlyRate:1200, availability:'Evenings & Weekends', type:'individual',
  verified:true, rating:4.8, totalBookings:24, responseRate:94,
}
