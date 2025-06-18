import { MapPin, Users, Clock, Star } from 'lucide-react';
import type { CareCenterData } from '../../types/chat';

interface CareCenterCardsProps {
  centers: CareCenterData[];
  metadata?: {
    zip_code: string;
    count: number;
  };
}

export const CareCenterCards: React.FC<CareCenterCardsProps> = ({ centers, metadata }) => {
  const getOperatingDaysText = (operatingDays?: number[]) => {
    if (!operatingDays || operatingDays.length === 0) {
      return 'Contact for hours';
    }
    
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const days = operatingDays.map(day => dayNames[day - 1]).join(', ');
    
    if (operatingDays.length === 5 && !operatingDays.includes(6) && !operatingDays.includes(7)) {
      return 'Mon - Fri';
    }
    if (operatingDays.length === 7) {
      return 'Every day';
    }
    return days;
  };

  const getCapacityColor = (capacity: number) => {
    if (capacity >= 40) return 'text-green-600 bg-green-50';
    if (capacity >= 25) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (centers.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Centers Found</h3>
        <p className="text-gray-600">
          {metadata?.zip_code && metadata.zip_code !== 'all areas' 
            ? `No childcare centers found in ${metadata.zip_code}. Try a different area.`
            : 'No childcare centers available at the moment.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {metadata && (
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center gap-2 text-blue-800">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">
              Found {metadata.count} center{metadata.count !== 1 ? 's' : ''} 
              {metadata.zip_code !== 'all areas' && ` in ${metadata.zip_code}`}
            </span>
          </div>
        </div>
      )}
      
      <div className="grid gap-3 max-h-96 overflow-y-auto">
        {centers.map((center) => (
          <div 
            key={center.id} 
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {center.name}
                </h3>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>ZIP Code: {center.zip_code}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium text-gray-700">4.5</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600">Capacity</div>
                  <div className={`text-sm font-medium px-2 py-1 rounded-full ${getCapacityColor(center.daily_capacity)}`}>
                    {center.daily_capacity} children
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600">Operating Days</div>
                  <div className="text-sm font-medium text-gray-900">
                    {getOperatingDaysText(center.operating_days)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-blue-500 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                Book Now
              </button>
              <button className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {centers.length > 3 && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Showing {Math.min(3, centers.length)} of {centers.length} centers
          </p>
        </div>
      )}
    </div>
  );
}; 