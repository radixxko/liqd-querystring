'use strict';

const sep = '&', eq = '=';
const SEP = sep.charCodeAt(0), EQ = eq.charCodeAt(0);
const intRE = /^[0-9]+$/;

const Assign = ( obj, key, value ) =>
{
    let keys = key.replace(/\]\[/g, '[').replace(/]$/,'').split('[');

    for( let i = 0; i < keys.length; ++i )
    {
        let key = keys[i];

        if( key && intRE.test( key )){ key = parseInt( keys[i] ); }
        else if( key === '' ){ key = Math.max( -1, ...Object.keys(obj).map( k => intRE.test(k) ? parseInt(k) : -1 )) + 1; }

        if( i < keys.length - 1 )
        {
            if( !obj.hasOwnProperty( key ) || ( typeof obj[key] !== 'object' ))
            {
                obj[key] = {};
            }

            obj = obj[key];
        }
        else
        {
            if( obj.hasOwnProperty( key ))
            {
                if( typeof obj[key] !== 'object' )
                {
                    obj[key] = { '0': obj[key] };
                }

                obj[key][Math.max( -1, ...Object.keys(obj[key]).map( k => intRE.test(k) ? parseInt(k) : -1 )) + 1] = value;
            }
            else{ obj[key] = value; }
        }
    }
}

const Convert = ( obj ) =>
{
    for( let key of Object.keys( obj ))
    {
        if( typeof obj[key] === 'object' && obj[key] !== null )
        {
            obj[key] = Convert( obj[key] );
        }
    }

    if( Object.keys(obj).findIndex( k => !intRE.test(k) ) === -1 &&  Object.keys(obj).length )
    {
        let arr = [];

        for( let key of Object.keys(obj))
        {
            arr[parseInt( key )] = obj[key];
        }

        return arr;
    }

    return obj;
}

module.exports = class Querystring
{
    static parse( querystring )
    {
        let data = {}, key, value, pair, last_pair = 0;

        do
        {
            pair = querystring.indexOf( sep, last_pair ); if( pair === -1 ){ pair = querystring.length; }

            if( pair - last_pair > 1 )
            {
                if( ~( value = querystring.indexOf( eq, last_pair )) && value < pair )
                {
                    key = decodeURIComponent( querystring.substring( last_pair, value ).replace(/\+/g, ' ' ));
                    value = decodeURIComponent( querystring.substring( value + 1, pair ).replace(/\+/g, ' ' ));

                    Assign( data, key, value );
                }
                else
                {
                    Assign( data, decodeURIComponent( querystring.substring( last_pair, pair ).replace(/\+/g, ' ' )), null );
                }
            }

            last_pair = pair + 1;
        }
        while( last_pair < querystring.length );

        return Convert( data );
    }
}
