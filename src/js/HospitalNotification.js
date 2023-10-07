import React, { Component } from 'react';
import hospitalData from './hospitalData';
import '../scss/HospitalNotification.scss';

class HospitalNotification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userLocation: null,
      hospitals: [],
      selectedHospital: null,

    };
  }

  componentDidMount() {
    this.fetchUserLocation();
  }

  fetchUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          this.setState({ userLocation });
          this.fetchHospitals(userLocation);
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by your browser.');
    }
  };

  fetchHospitals = async (userLocation) => {
    const hospitalAddresses = []; // Replace with actual hospital addresses

    const service = new window.google.maps.DistanceMatrixService();

    const origins = [userLocation];
    const destinations = hospitalData.map((hospital) => hospital.location);

    service.getDistanceMatrix(
      {
        origins,
        destinations,
        travelMode: 'DRIVING',
        unitSystem: window.google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
      },
      (response, status) => {
        if (status === 'OK') {
          const hospitals = response.destinationAddresses.map((destination, index) => {
            return {
              name: hospitalData[index].name,
              distance: response.rows[0].elements[index].distance.text,
              duration: response.rows[0].elements[index].duration.text,
              healthInsurance:hospitalData[index].healthInsurance,
              waitTime:hospitalData[index].waitTime
            };
          });

          this.setState({ hospitals });
        } else {
          console.error('Error fetching hospital data:', status);
        }
      }
    );
  };
  handleSelectHospital = (selectedHospital) => {
    this.setState({ selectedHospital });
  };

  handleSendUserInfo = () => {
    const { selectedHospital } = this.state;

    // You can add logic here to send user information to the selected hospital
    if (selectedHospital) {
      // Example: Alert the hospital name
      alert(`Sending user information to ${selectedHospital.name}`);
    } else {
      alert('Please select a hospital before sending user information.');
    }
  };

  render() {
    const { userLocation, hospitals, selectedHospital } = this.state;

    return (
      <div className='hospitalContainer'>
        <h2>Hospital List</h2>
        {userLocation && (
          <ul>
            {hospitals.map((hospital, index) => (
              <li key={index}>
                <strong>{hospital.name}</strong>
                <p>Distance: {hospital.distance}</p>
                <p>Duration: {hospital.duration}</p>
                <p>Health Insurance: {hospital.healthInsurance}</p>
                <p>Wait Time: {hospital.waitTime} minutes</p>

                {/* Button to select the hospital */}
                <button
                  onClick={() => this.handleSelectHospital(hospital)}
                  disabled={selectedHospital === hospital}
                >
                  {selectedHospital === hospital ? 'Selected' : 'Select'}
                </button>
              </li>
            ))}
          </ul>
        )}
        {!userLocation && <p>Loading user location...</p>}

        {/* Button to send user information to the selected hospital */}
        {selectedHospital && (
          <div>
            <button onClick={this.handleSendUserInfo}>
              Send User Information to {selectedHospital.name}
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default HospitalNotification;
