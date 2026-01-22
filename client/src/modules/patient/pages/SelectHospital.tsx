import {MapPin} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';


interface Hospital {
  id: number;
  name: string;
  image: string;
  description: string;
  location: string;
}

const SelectHospital: React.FC = () => {

  const hospitals: Hospital[] = [
    {
      id: 1,
      name: 'menath hospital',
      image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400&h=250&fit=crop',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing Quisque placerat Convallis felis vitae tortor augue. Velit nascetur massa in.',
      location: 'kozhikode ramanthukara kozhipuram'
    },
    {
      id: 2,
      name: 'ayur hospital',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=250&fit=crop',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing Quisque placerat Convallis felis vitae tortor augue. Velit nascetur massa in.',
      location: 'kozhikode ramanthukara kozhipuram'
    },
    {
      id: 3,
      name: 'samba hospital',
      image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=250&fit=crop',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing Quisque placerat Convallis felis vitae tortor augue. Velit nascetur massa in.',
      location: 'kozhikode ramanthukara kozhipuram'
    },
    {
      id: 4,
      name: 'kumar hospital',
      image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&h=250&fit=crop',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing Quisque placerat Convallis felis vitae tortor augue. Velit nascetur massa in.',
      location: 'kozhikode ramanthukara kozhipuram'
    },
    {
      id: 5,
      name: 'arun hospital',
      image: 'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=400&h=250&fit=crop',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing Quisque placerat Convallis felis vitae tortor augue. Velit nascetur massa in.',
      location: 'kozhikode ramanthukara kozhipuram'
    },
    {
      id: 6,
      name: 'amma hospital',
      image: 'https://images.unsplash.com/photo-1596541223130-5d31a73fb6c6?w=400&h=250&fit=crop',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing Quisque placerat Convallis felis vitae tortor augue. Velit nascetur massa in.',
      location: 'kozhikode ramanthukara kozhipuram'
    },
    {
      id: 7,
      name: 'menath hospital',
      image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400&h=250&fit=crop',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing Quisque placerat Convallis felis vitae tortor augue. Velit nascetur massa in.',
      location: 'kozhikode ramanthukara kozhipuram'
    },
    {
      id: 8,
      name: 'ayur hospital',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=250&fit=crop',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing Quisque placerat Convallis felis vitae tortor augue. Velit nascetur massa in.',
      location: 'kozhikode ramanthukara kozhipuram'
    },
    {
      id: 9,
      name: 'samba hospital',
      image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=250&fit=crop',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing Quisque placerat Convallis felis vitae tortor augue. Velit nascetur massa in.',
      location: 'kozhikode ramanthukara kozhipuram'
    },
    {
      id: 10,
      name: 'kumar hospital',
      image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&h=250&fit=crop',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing Quisque placerat Convallis felis vitae tortor augue. Velit nascetur massa in.',
      location: 'kozhikode ramanthukara kozhipuram'
    },
    {
      id: 11,
      name: 'arun hospital',
      image: 'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=400&h=250&fit=crop',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing Quisque placerat Convallis felis vitae tortor augue. Velit nascetur massa in.',
      location: 'kozhikode ramanthukara kozhipuram'
    },
    {
      id: 12,
      name: 'amma hospital',
      image: 'https://images.unsplash.com/photo-1596541223130-5d31a73fb6c6?w=400&h=250&fit=crop',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing Quisque placerat Convallis felis vitae tortor augue. Velit nascetur massa in.',
      location: 'kozhikode ramanthukara kozhipuram'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
     <Navbar/>

      {/* Hospital Grid */}
      <div className="max-w-fit mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hospitals.map((hospital: Hospital) => (
            <div
              key={hospital.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={hospital.image}
                  alt={hospital.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-indigo-900 mb-3 capitalize">
                  {hospital.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {hospital.description}
                </p>
                <div className="flex items-start gap-2 text-gray-500 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{hospital.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
<Footer/>
     
    </div>
  );
};

export default SelectHospital;