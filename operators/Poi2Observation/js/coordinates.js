/*
 *     (C) Copyright 2013 CoNWeT Lab., Universidad Politécnica de Madrid
 *
 *     This file is part of the poi2observation widget.
 *
 *     poi2observation is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or (at
 *     your option) any later version.
 *
 *     poi2observation is distributed in the hope that it will be useful, but
 *     WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero
 *     General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with poi2observation. If not, see
 *     <http://www.gnu.org/licenses/>.
 *
 *     Linking this library statically or dynamically with other modules is
 *     making a combined work based on this library.  Thus, the terms and
 *     conditions of the GNU Affero General Public License cover the whole
 *     combination.
 *
 *     As a special exception, the copyright holders of this library give you
 *     permission to link this library with independent modules to produce an
 *     executable, regardless of the license terms of these independent
 *     modules, and to copy and distribute the resulting executable under
 *     terms of your choice, provided that you also meet, for each linked
 *     independent module, the terms and conditions of the license of that
 *     module.  An independent module is a module which is not derived from
 *     or based on this library.  If you modify this library, you may extend
 *     this exception to your version of the library, but you are not
 *     obligated to do so.  If you do not wish to do so, delete this
 *     exception statement from your version.
 *
 */

/*
* Reference: Hoffmann-Wellenhof, B., Lichtenegger, H., and Collins, J.,
*   GPS: Theory and Practice, 3rd ed.  New York: Springer-Verlag Wien, 1994.
*/
function Coordinates (datumDescriptor){
	if (Coordinates.DATUM_ED50==datumDescriptor) {
	    this.a = Coordinates.ED50_A;
	    this.b = Coordinates.ED50_B;
	} else if (Coordinates.DATUM_WGS72==datumDescriptor) {
        this.a = Coordinates.WGS72_A;
        this.b = Coordinates.WGS72_B;
    } else if (Coordinates.DATUM_GRS80==datumDescriptor) {
        this.a = Coordinates.GRS80_A;
        this.b = Coordinates.GRS80_B;
    } else {
	    this.a = Coordinates.WGS84_A;
	    this.b = Coordinates.WGS84_B;
	}
	this.datum = datumDescriptor;
} /*Coordinates*/

/* Scale Factor */
Coordinates.UTMSCALEFACTOR = 0.9996;
/* Datums */
Coordinates.DATUM_WGS84 = "WGS84";
Coordinates.DATUM_ED50 = "ED50";
Coordinates.DATUM_WGS72 = "WGS72";
Coordinates.DATUM_GRS80 = "GRS80";
/* WGS84 Ellipsoid model major axis*/
Coordinates.WGS84_A = 6378137.0;
/* WGS84 Ellipsoid model minor axis*/
Coordinates.WGS84_B = 6356752.314245;
/* ED50 Ellipsoid model major axis*/
Coordinates.ED50_A = 6378388.0;
/* ED50 Ellipsoid model minor axis*/
Coordinates.ED50_B = 6356911.946128;
/* WGS72 Ellipsoid model major axis*/
Coordinates.WGS72_A = 6378135.0;
/* WGS72 Ellipsoid model minor axis*/
Coordinates.WGS72_B = 6356750.5200161;
/* GRS80 Ellipsoid model major axis*/
Coordinates.GRS80_A = 6378137.0;
/* GRS80 Ellipsoid model minor axis*/
Coordinates.GRS80_B = 6356752.314140;

/*
* degToRad
*
* Converts degrees to radians.
*
*/
Coordinates.prototype.degToRad = function (deg) {
    return (deg / 180.0 * Math.PI)
}

/*
* radToDeg
*
* Converts radians to degrees.
*
*/
Coordinates.prototype.radToDeg = function (rad) {
    return (rad / Math.PI * 180.0)
}

/*
* arcLengthOfMeridian
*
* Computes the ellipsoidal distance from the equator to a point at a
* given latitude.
*
* Inputs:
*     phi - Latitude of the point, in radians.
*
* Returns:
*     The ellipsoidal distance of the point from the equator, in meters.
*/
Coordinates.prototype.arcLengthOfMeridian = function  (phi) {
    var alpha, beta, gamma, delta, epsilon, n;
    var result;

    /* Precalculate n */
    n = (this.a - this.b) / (this.a + this.b);

    /* Precalculate alpha */
    alpha = ((this.a + this.b) / 2.0)
       * (1.0 + (Math.pow (n, 2.0) / 4.0) + (Math.pow (n, 4.0) / 64.0));

    /* Precalculate beta */
    beta = (-3.0 * n / 2.0) + (9.0 * Math.pow (n, 3.0) / 16.0)
       + (-3.0 * Math.pow (n, 5.0) / 32.0);

    /* Precalculate gamma */
    gamma = (15.0 * Math.pow (n, 2.0) / 16.0)
        + (-15.0 * Math.pow (n, 4.0) / 32.0);

    /* Precalculate delta */
    delta = (-35.0 * Math.pow (n, 3.0) / 48.0)
        + (105.0 * Math.pow (n, 5.0) / 256.0);

    /* Precalculate epsilon */
    epsilon = (315.0 * Math.pow (n, 4.0) / 512.0);

    /* Now calculate the sum of the series and return */
    result = alpha
        * (phi + (beta * Math.sin (2.0 * phi))
            + (gamma * Math.sin (4.0 * phi))
            + (delta * Math.sin (6.0 * phi))
            + (epsilon * Math.sin (8.0 * phi)));

    return result;
}

/*
* utmCentralMeridian
*
* Determines the central meridian for the given UTM zone.
*
* Inputs:
*     zone - An integer value designating the UTM zone, range [1,60].
*
* Returns:
*   The central meridian for the given UTM zone, in radians, or zero
*   if the UTM zone parameter is outside the range [1,60].
*   Range of the central meridian is the radian equivalent of [-177,+177].
*/
Coordinates.prototype.utmCentralMeridian = function (zone) {
    var cmeridian;

    cmeridian = this.degToRad (-183.0 + (zone * 6.0));
    return cmeridian;
}

/*
* footpointLatitude
*
* Computes the footpoint latitude for use in converting transverse
* Mercator coordinates to ellipsoidal coordinates.
*
* Inputs:
*   y - The UTM northing coordinate, in meters.
*
* Returns:
*   The footpoint latitude, in radians.
*/
Coordinates.prototype.footpointLatitude = function (y) {
    var y_, alpha_, beta_, gamma_, delta_, epsilon_, n;
    var result;
    
    /* Precalculate n (Eq. 10.18) */
    n = (this.a - this.b) / (this.a + this.b);
        
    /* Precalculate alpha_ (Eq. 10.22) */
    /* (Same as alpha in Eq. 10.17) */
    alpha_ = ((this.a + this.b) / 2.0)
        * (1 + (Math.pow (n, 2.0) / 4.0) + (Math.pow (n, 4.0) / 64.0));
    
    /* Precalculate y_ (Eq. 10.23) */
    y_ = y / alpha_;
    
    /* Precalculate beta_ (Eq. 10.22) */
    beta_ = (3.0 * n / 2.0) + (-27.0 * Math.pow (n, 3.0) / 32.0)
        + (269.0 * Math.pow (n, 5.0) / 512.0);
    
    /* Precalculate gamma_ (Eq. 10.22) */
    gamma_ = (21.0 * Math.pow (n, 2.0) / 16.0)
        + (-55.0 * Math.pow (n, 4.0) / 32.0);
        
    /* Precalculate delta_ (Eq. 10.22) */
    delta_ = (151.0 * Math.pow (n, 3.0) / 96.0)
        + (-417.0 * Math.pow (n, 5.0) / 128.0);
        
    /* Precalculate epsilon_ (Eq. 10.22) */
    epsilon_ = (1097.0 * Math.pow (n, 4.0) / 512.0);
        
    /* Now calculate the sum of the series (Eq. 10.21) */
    result = y_ + (beta_ * Math.sin (2.0 * y_))
        + (gamma_ * Math.sin (4.0 * y_))
        + (delta_ * Math.sin (6.0 * y_))
        + (epsilon_ * Math.sin (8.0 * y_));
    
    return result;
}

/*
* mapGeoToXY
*
* Converts a latitude/longitude pair to x and y coordinates in the
* Transverse Mercator projection.  Note that Transverse Mercator is not
* the same as UTM; a scale factor is required to convert between them.
*
* Inputs:
*    phi - Latitude of the point, in radians.
*    lambda - Longitude of the point, in radians.
*    lambda0 - Longitude of the central meridian to be used, in radians.
*
* Outputs:
*    xy - A 2-element array containing the x and y coordinates
*         of the computed point.
*
* Returns:
*    The function does not return a value.
*/
Coordinates.prototype.mapGeoToXY = function (phi, lambda, lambda0, xy) {
    var N, nu2, ep2, t, t2, l;
    var l3coef, l4coef, l5coef, l6coef, l7coef, l8coef;
    var tmp;
    /* Precalculate ep2 */
    ep2 = (Math.pow (this.a, 2.0) - Math.pow (this.b, 2.0)) / Math.pow (this.b, 2.0);

    /* Precalculate nu2 */
    nu2 = ep2 * Math.pow (Math.cos (phi), 2.0);

    /* Precalculate N */
    N = Math.pow (this.a, 2.0) / (this.b * Math.sqrt (1 + nu2));

    /* Precalculate t */
    t = Math.tan (phi);
    t2 = t * t;
    tmp = (t2 * t2 * t2) - Math.pow (t, 6.0);

    /* Precalculate l */
    l = lambda - lambda0;

    /* Precalculate coefficients for l**n in the equations below
       so a normal human being can read the expressions for easting
       and northing
       -- l**1 and l**2 have coefficients of 1.0 */
    l3coef = 1.0 - t2 + nu2;

    l4coef = 5.0 - t2 + 9.0 * nu2 + 4.0 * (nu2 * nu2);

    l5coef = 5.0 - 18.0 * t2 + (t2 * t2) + 14.0 * nu2
        - 58.0 * t2 * nu2;

    l6coef = 61.0 - 58.0 * t2 + (t2 * t2) + 270.0 * nu2
        - 330.0 * t2 * nu2;

    l7coef = 61.0 - 479.0 * t2 + 179.0 * (t2 * t2) - (t2 * t2 * t2);

    l8coef = 1385.0 - 3111.0 * t2 + 543.0 * (t2 * t2) - (t2 * t2 * t2);

    /* Calculate easting (x) */
    xy[0] = N * Math.cos (phi) * l
        + (N / 6.0 * Math.pow (Math.cos (phi), 3.0) * l3coef * Math.pow (l, 3.0))
        + (N / 120.0 * Math.pow (Math.cos (phi), 5.0) * l5coef * Math.pow (l, 5.0))
        + (N / 5040.0 * Math.pow (Math.cos (phi), 7.0) * l7coef * Math.pow (l, 7.0));

    /* Calculate northing (y) */
    xy[1] = this.arcLengthOfMeridian (phi)
        + (t / 2.0 * N * Math.pow (Math.cos (phi), 2.0) * Math.pow (l, 2.0))
        + (t / 24.0 * N * Math.pow (Math.cos (phi), 4.0) * l4coef * Math.pow (l, 4.0))
        + (t / 720.0 * N * Math.pow (Math.cos (phi), 6.0) * l6coef * Math.pow (l, 6.0))
        + (t / 40320.0 * N * Math.pow (Math.cos (phi), 8.0) * l8coef * Math.pow (l, 8.0));
    return;
}

/*
* mapXYToGeo
*
* Converts x and y coordinates in the Transverse Mercator projection to
* a latitude/longitude pair.  Note that Transverse Mercator is not
* the same as UTM; a scale factor is required to convert between them.
*
* Inputs:
*   x - The easting of the point, in meters.
*   y - The northing of the point, in meters.
*   lambda0 - Longitude of the central meridian to be used, in radians.
*
* Outputs:
*   philambda - A 2-element containing the latitude and longitude
*               in radians.
*
* Returns:
*   The function does not return a value.
*/
Coordinates.prototype.mapXYToGeo = function (x, y, lambda0, philambda) {
    var phif, Nf, Nfpow, nuf2, ep2, tf, tf2, tf4, cf;
    var x1frac, x2frac, x3frac, x4frac, x5frac, x6frac, x7frac, x8frac;
    var x2poly, x3poly, x4poly, x5poly, x6poly, x7poly, x8poly;

    /* Get the value of phif, the footpoint latitude. */
    phif = this.footpointLatitude (y);

    /* Precalculate ep2 */
    ep2 = (Math.pow (this.a, 2.0) - Math.pow (this.b, 2.0))
          / Math.pow (this.b, 2.0);
    
    /* Precalculate cos (phif) */
    cf = Math.cos (phif);

    /* Precalculate nuf2 */
    nuf2 = ep2 * Math.pow (cf, 2.0);

    /* Precalculate Nf and initialize Nfpow */
    Nf = Math.pow (this.a, 2.0) / (this.b * Math.sqrt (1.0 + nuf2));
    Nfpow = Nf;

    /* Precalculate tf */
    tf = Math.tan (phif);
    tf2 = tf * tf;
    tf4 = tf2 * tf2;

    /* Precalculate fractional coefficients for x**n in the equations
       below to simplify the expressions for latitude and longitude. */
    x1frac = 1.0 / (Nfpow * cf);

    Nfpow *= Nf;   /* now equals Nf**2) */
    x2frac = tf / (2.0 * Nfpow);

    Nfpow *= Nf;   /* now equals Nf**3) */
    x3frac = 1.0 / (6.0 * Nfpow * cf);

    Nfpow *= Nf;   /* now equals Nf**4) */
    x4frac = tf / (24.0 * Nfpow);

    Nfpow *= Nf;   /* now equals Nf**5) */
    x5frac = 1.0 / (120.0 * Nfpow * cf);

    Nfpow *= Nf;   /* now equals Nf**6) */
    x6frac = tf / (720.0 * Nfpow);

    Nfpow *= Nf;   /* now equals Nf**7) */
    x7frac = 1.0 / (5040.0 * Nfpow * cf);

    Nfpow *= Nf;   /* now equals Nf**8) */
    x8frac = tf / (40320.0 * Nfpow);

    /* Precalculate polynomial coefficients for x**n.
       -- x**1 does not have a polynomial coefficient. */
    x2poly = -1.0 - nuf2;

    x3poly = -1.0 - 2.0 * tf2 - nuf2;

    x4poly = 5.0 + 3.0 * tf2 + 6.0 * nuf2 - 6.0 * tf2 * nuf2
        - 3.0 * (nuf2 *nuf2) - 9.0 * tf2 * (nuf2 * nuf2);

    x5poly = 5.0 + 28.0 * tf2 + 24.0 * tf4 + 6.0 * nuf2 + 8.0 * tf2 * nuf2;

    x6poly = -61.0 - 90.0 * tf2 - 45.0 * tf4 - 107.0 * nuf2
        + 162.0 * tf2 * nuf2;

    x7poly = -61.0 - 662.0 * tf2 - 1320.0 * tf4 - 720.0 * (tf4 * tf2);

    x8poly = 1385.0 + 3633.0 * tf2 + 4095.0 * tf4 + 1575.0 * (tf4 * tf2);

    /* Calculate latitude */
    philambda[0] = phif + x2frac * x2poly * (x * x)
        + x4frac * x4poly * Math.pow (x, 4.0)
        + x6frac * x6poly * Math.pow (x, 6.0)
        + x8frac * x8poly * Math.pow (x, 8.0);

    /* Calculate longitude */
    philambda[1] = lambda0 + x1frac * x
        + x3frac * x3poly * Math.pow (x, 3.0)
        + x5frac * x5poly * Math.pow (x, 5.0)
        + x7frac * x7poly * Math.pow (x, 7.0);

    return;
}


/*
* geoRadToUTM
*
* Converts a latitude/longitude pair to x and y coordinates in the
* Universal Transverse Mercator projection.
*
* Inputs:
*   lat - Latitude of the point, in radians.
*   lon - Longitude of the point, in radians.
*   zone - UTM zone to be used for calculating values for x and y.
*          If zone is less than 1 or greater than 60, the routine
*          will determine the appropriate zone from the value of lon.
*
* Outputs:
*   xy - A 2-element array where the UTM x and y values will be stored.
*
* Returns:
*   The function does not return a value.
*/
Coordinates.prototype.geoRadToUTM = function (lat, lon, zone, xy) {

    this.mapGeoToXY (lat, lon, this.utmCentralMeridian(zone), xy);
    /* Adjust easting and northing for UTM system. */
    xy[0] = xy[0] * Coordinates.UTMSCALEFACTOR + 500000.0;
    xy[1] = xy[1] * Coordinates.UTMSCALEFACTOR;
    if (xy[1] < 0.0){
        xy[1] = xy[1] + 10000000.0;
    }
    return;
}

/*
* utmToGeoRad
*
* Converts x and y coordinates in the Universal Transverse Mercator
* projection to a latitude/longitude pair (in radians).
*
* Inputs:
*   x - The easting of the point, in meters.
*   y - The northing of the point, in meters.
*   zone - The UTM zone in which the point lies.
*   southhemi - True if the point is in the southern hemisphere;
*               false otherwise.
*
* Outputs:
*   latlon - A 2-element array containing the latitude and
*            longitude of the point, in radians.
*
* Returns:
*   The function does not return a value.
*/
Coordinates.prototype.utmToGeoRad = function (x, y, zone, southhemi, latlon) {

    var cmeridian;

    x -= 500000.0;
    x /= Coordinates.UTMSCALEFACTOR;

    /* If in southern hemisphere, adjust y accordingly. */
    if (southhemi){
        y -= 10000000.0;
    }
    y /= Coordinates.UTMSCALEFACTOR;

    cmeridian = this.utmCentralMeridian (zone);
    this.mapXYToGeo (x, y, cmeridian, latlon);

    return;
}

/*
* geoDegToUTM
*
* Converts a latitude/longitude pair to x and y coordinates in the
* Universal Transverse Mercator projection.
*
* Inputs:
*   lat - Latitude of the point, in degrees.
*   lon - Longitude of the point, in degrees.
*   zone - UTM zone to be used for calculating values for x and y.
*          If zone is less than 1 or greater than 60, the routine
*          will determine the appropriate zone from the value of lon.
*
* Outputs:
*   xy - A 2-element array where the UTM x and y values will be stored.
*
* Returns:
*   The function does not return a value.
*/
Coordinates.prototype.geoDegToUTM = function (lat, lon, zone, xy) {
    // Compute the UTM zone.
    zone = Math.floor ((lon + 180.0) / 6) + 1;
    zone = this.geoRadToUTM (this.degToRad (lat), this.degToRad (lon), zone, xy);
    return;
}

/*
* utmToGeoDeg
*
* Converts x and y coordinates in the Universal Transverse Mercator
* projection to a latitude/longitude pair (in degrees).
*
* Inputs:
*   x - The easting of the point, in meters.
*   y - The northing of the point, in meters.
*   zone - The UTM zone in which the point lies.
*   southhemi - True if the point is in the southern hemisphere;
*               false otherwise.
*
* Outputs:
*   latlon - A 2-element array containing the latitude and
*            longitude of the point, in degrees.
*
* Returns:
*   The function does not return a value.
*/
Coordinates.prototype.utmToGeoDeg = function (x, y, zone, southhemi, latlon) {                                 
    this.utmToGeoRad (x, y, zone, southhemi, latlon);

    latlon[0] = this.radToDeg (latlon[0]);
    latlon[1] = this.radToDeg (latlon[1]);

    return;
}
