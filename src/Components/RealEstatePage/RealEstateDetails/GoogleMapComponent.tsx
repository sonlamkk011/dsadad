import React from 'react'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const googleMapApiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY as string

function GoogleMapComponent({ center, googleMapSize }: any) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: googleMapApiKey
    })

    return isLoaded ? (
        <GoogleMap
            mapContainerStyle={googleMapSize}
            center={center}
            zoom={16}
        >
            { /* Child components, such as markers, info windows, etc. */}
            <Marker
                position={center}
            />
        </GoogleMap>
    ) : <></>
}

export default React.memo(GoogleMapComponent)