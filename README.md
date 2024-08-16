
# USER INSTRUCTIONS AND REQUIREMENTS

## 1.  Deliverables here

1. Source code of the web application.
2. Brief documentation.


## 2. Evaluation Criteria

• Correctness: Does the application correctly fetch and display the data?
• Code Quality: Is the code well-structured and easy to understand?
• Interactivity: How interactive are the charts?
• Responsiveness: Do the charts work well on different devices and screen sizes?
• Performance: How fast user displaying the charts?
• Documentation: Is the documentation clear and helpful?

## 3. Requirements

```
npm install chartjs-plugin-zoom
npm i d3
npm i --save-dev @types/d3
npm i sass

```

## 4. Brief Documentation

1. clone the repository from 
```
git clone https://github.com/LINOSNCHENA/Trading-energy-dashboard.git
```
2. Change directory to location inside the repository 
3. From inside this directory run application using the  following two commands in appropriate order as show 
```
npm i
npm run dev
```

4. If no error found then goto your localhost at [www.localhost.3000](http://localhost:3000/#/daily)
5. On this page  you are login using a guest user account (guest@gmail.com)
6. You will find four difference tabs existing on a single page. 
7. The following are the tabs;

a. [www.locahost/3000/#/weekly](http://localhost:3000/#/weekly)
b. [www.localhost/3000/#/daily](http://localhost:3000/#/daily)
c. [www.localhost/3000/#/monthly](http://localhost:3000/#/monthly)
d. [www.localhost/3000/#/area](http://localhost:3000/#/area)

8. On page title Trading you can find four tabs, 1. Daily Data 2. Weekly data, 3 Monthly data and  4. Area trends Tab as required by assigmnent.
9. To exit or close the app click on admin and this logs ypu out and locks the data access.
10. This ends the exploration of the app.


## 5. Pending Issues and Tasks

1. More test cases have to be implementted
2. Data access is limited to 15 tmes by the source API. Hence the data is saved in json for use if more than 15 access times is needed in a day.
3. Security and Authentication and password
4. TBA



 ## End 