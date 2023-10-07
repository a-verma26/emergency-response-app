import React, { Component } from 'react';
import HospitalNotification from './HospitalNotification';
import MapComponent from './MapComponent';
import RealTimeChat from './RealTimeChat';
import '../scss/EmergencyForm.scss';
import SpeechToTextDemo from './SpeechToText';
import SpeechToText from './SpeechToText';

class EmergencyForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      emergencyType: '',
      emergencyDetails: '', // Added state for emergency details
      isSubmitClicked: false,
      notifyNearbyHospital: false,
      userLocation: {
        latitude: null,
        longitude: null,
        address: '',
      },
    };
  }

  componentDidMount() {
    this.fetchUserLocation();
  }

  fetchUserLocation = () => {
    const apiKey = process.env.REACT_APP_API_KEY;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          // Reverse geocoding using Google Maps Geocoding API
          const reverseGeocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${userLocation.latitude},${userLocation.longitude}&key=${apiKey}`;
          
          try {
            const response = await fetch(reverseGeocodingUrl);
            const data = await response.json();

            if (data.results && data.results.length > 0) {
              const address = data.results[0].formatted_address;
              this.setState((prevState) => ({
                userLocation: {
                  ...prevState.userLocation,
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                  address: address,
                },
              }));
            }
          } catch (error) {
            console.error('Error fetching user address:', error);
          }
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by your browser.');
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { emergencyType, emergencyDetails } = this.state;
    this.setState({ isSubmitClicked: true });
    this.props.onSubmit(emergencyType, emergencyDetails);
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleNotifyHospital = () => {
    this.setState({ notifyNearbyHospital: true });
  };

  render() {
    const { emergencyType, emergencyDetails, isSubmitClicked, notifyNearbyHospital, userLocation } = this.state;

    return (
      <div className='headContainer'>
      {!isSubmitClicked && <div className='emergencyFormContainer'>
          <form onSubmit={this.handleSubmit}>
          <label>
            Type of Emergency:
            <select name="emergencyType" value={emergencyType} onChange={this.handleChange}>
              <option value="">Select an Emergency Type</option>
              <option value="Cardiac Arrest">Cardiac Arrest</option>
              <option value="Choking">Choking</option>
              <option value="Trauma">Trauma</option>
              <option value="Heart Attack">Heart Attack</option>
              <option value="Accident">Accident</option>
              <option value="Seizure">Seizure</option>
              <option value="Stroke">Stroke</option>
              <option value="Diabetic Emergency">Diabetic Emergency</option>
              <option value="Allergic Reaction">Allergic Reaction (Anaphylaxis)</option>
            </select>
          </label>
          {/* <SpeechToTextDemo/> */}
          <label>
            Additional Details:
            <textarea
              name="emergencyDetails"
              value={emergencyDetails}
              onChange={this.handleChange}
              rows="4"
              cols="50"
              placeholder="Provide additional details or notes about the emergency..."
            />
          </label>
        
          <button type="submit">Submit</button>
        </form>
        <SpeechToText/>
        </div>}
        {isSubmitClicked && (
          <div className='mapContainer'>
            <MapComponent emergencyType={emergencyType} />
            {userLocation && userLocation.address && (
              <div>
                <h3>Your Current Location</h3>
                <p>Address: {userLocation.address}</p>
              </div>
            )}
            
            <div>
              Would you like to notify the nearby hospital to prepare for the patient's arrival in advance?
              You can also choose to notify the hospital after the CPR practitioner arrives.
            </div>
            
            <button onClick={this.handleNotifyHospital}>Notify Nearby Hospital</button>
            <div>Your current location has been shared with nearby CPR practitioners.</div>
            <div>Your current location has been shared with nearby Ambulance. Estimated time to arrive is 14 minutes </div>
            
           
            
          </div>
        )}
      
    
      {notifyNearbyHospital && <HospitalNotification />}
      {isSubmitClicked && <RealTimeChat emergencyType={emergencyType} />}
     {!isSubmitClicked &&  <div className='footer'>
  <h3>Frequently Asked Questions</h3>
  <ul>
    <li>
      <strong>Q: How does the app work?</strong>
      <p>A: The app connects users with nearby CPR practitioners and emergency services to provide timely assistance during emergencies.</p>
    </li>
    <li>
      <strong>Q: What information is shared with CPR practitioners?</strong>
      <p>A: Only essential information, such as your location and emergency type, is shared with CPR practitioners to ensure a prompt response.</p>
    </li>
    <li>
      <strong>Q: How is my data handled?</strong>
      <p>A: Your data is handled securely and is only used for emergency response purposes. We prioritize user privacy and data protection.</p>
    </li>
    {/* Add more FAQs as needed */}
  </ul>
</div>}
    </div>

    );
  }
}

export default EmergencyForm;
