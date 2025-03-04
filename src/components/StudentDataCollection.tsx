import React from 'react';

const StudentDataCollection: React.FC = () => {


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSdcemvbdqeUATEx1QkQqP_0HEmjgHPOBi6UIw5g2Hzf4S_hFw/viewform?embedded=true"
            width="100%"
            height="1557"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            className="w-full"

          >
            Loading…
          </iframe>
        </div>
        <div className="mt-4 text-center text-gray-600">
          <p>Having trouble submitting? Please contact support.</p>

        </div>
      </div>
    </div>
  );
};

export default StudentDataCollection;