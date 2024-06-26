Comprehensive Document

A: Overview

    -Problem Context:
        The problem we are working towards is fixing the lack of availability of applications that are geared towards LEGO Mindstorm sets in finding 
        bricks for individuals that are visually impaired, as well as easing and providing convenience for people who are interested in building these sets.
    -Goals:
        We are aiming to create an application to aid in finding a specific LEGO Mindstorm Block in a large pile, as well as identify a single specific piece. 
        This would help streamline the building of Mindstorm Robots and make building projects with Mindstorm Blocks accessible to all. 

B: Assumptions
    - We assume the user  will have a working IOS(14.8+)/Android(8.1+) with the Expo Go application phone to test the program

C: Dependencies
    -To install all necessary dependencies, run the line `yarn install` in the source code folder. To view a list of all included dependencies, read the package.json file.
    -The only API call made is to roboflow model to locate legos on the screen and retrieve their position on the screen.

D: Constraints
    -Identification model is limited and works about 50% of the time, also has trouble with similar pieces
    -Locating model works extremely well but only with 23 parts, we did not have enough time to implement all parts (parts that work: 4513174, 4666579,  4121715, 4206482, 4640536, 4514553, 4198367, 4173941, 4153707, 4552347, 4248204, 4211651, 4162857, 6271161, 4652235, 4535768, 4582792, 4540797, 6195314, 6271827, 6331428, 6313453   )
    -App uses too much gpu, has memory leak
    

E: Description of Deployment Artifacts
    - Everything needed to run this program is included in the source code

F: Data Creation
    - The parts are all located in the source code, thus there is no database needed to run the app. All lego part data is located in the database.json file.

G: Admin Credentials
    - API keys for roboflow and ultralytics will eventually expire, and new keys will need to be attained then by registering accounts.

H: Deployment process
    - Unzip the file 
    - Open the file with your IDE 
        - if your phone is not on the same internet connection as your computer you will need to use the command "npx expo start --tunnel"
        - but if this fails, try yard add expo@^49.0.0 in your IDE terminal, then npx expo-doctor, npx expo install --check, and then retry start above
    - Open the expo go app on your phone
    - Scan the QR code provided in the terminal


# TIL
nodemodules handled by package managers. 

# Trello
https://trello.com/w/dustblockblues
