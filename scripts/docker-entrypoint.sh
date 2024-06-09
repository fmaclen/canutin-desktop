#!/bin/bash

COLOR_BLUE_START="\033[0;34m"
COLOR_GREEN_START="\033[1;32m"
COLOR_END="\033[0m"

echo -e "
${COLOR_BLUE_START}
                                        
                      ..,;:;,..         
                  .':lkKNWWWNKxc.       
                .'oKNWNkoccld0WWO;.     
              .'oKWWW0:.    ..oXM0,     
            .'oKWMMXOc.       .kWNl.    
          .'oKWMMMMNKl.       'OMNc.    
        .'oKWMMMMMMMWKo'.  ..;kWWx.     
      .'oKWMMMMMMMMMMMWXkxdx0NWKl.      
     .:0WMMMMMMMMMMMMMMMMMMMWKo'.       
     ;KMMMMMMMMMMMMMMMMMMMWKo'.         
    .oNMMMMMMMMMMMMMMMMMWKo'.           
    .cXMMMMMMMMMMMMMMMWKo'.             
     .dNMMMMMMMMMMMWNKo'.               
      .cONMMMMMMMN0o:'.                 
        .;ldkkkxo:..                    
            ...                         
                                        
${COLOR_END}
"

echo "
-> Current configuration
"
echo -e "-- HOST:               ${COLOR_GREEN_START} $HOST ${COLOR_END}"
echo -e "-- PORT:               ${COLOR_GREEN_START} $PORT ${COLOR_END}"
echo -e "-- DATABASE_URL:       ${COLOR_GREEN_START} $DATABASE_URL ${COLOR_END}"
echo -e "-- SHOULD_CHECK_VAULT: ${COLOR_GREEN_START} $SHOULD_CHECK_VAULT ${COLOR_END}"
echo -e "-- APP_VERSION:        ${COLOR_GREEN_START} $APP_VERSION ${COLOR_END}"

echo ""
echo "-> Starting server"
node index.js
