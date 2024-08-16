
# INSTRUCTIONS AND REQUIREMENTS

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
git clone https://github.com/LINOSNCHENA/Trading-energy-dashboard/tree/main
```
2. CD to inside the repository and run following command npm install
3. Run application with this command   npm run dev

1. On the www.localhost.3000
2. On the page login using a guest password test1@gmail.com
3. Four difference pages exist as tabs
a. [www.locahost/3000/#/weekly](http://localhost:3000/#/weekly)
b. [www.localhost/3000/#/daily](http://localhost:3000/#/daily)
c. [www.localhost/3000/#/monthly](http://localhost:3000/#/monthly)
d. [www.localhost/3000/#/area](http://localhost:3000/#/area)

4. On Commodities you can find four tabs, 1. Daily Data 2. Weekly data, 3. 4. Maximum-Minimum data
5. On Json page two tabs exist. 1. Data is displayed in Json format 2. The maximum-mimum record is shown and a new dataset showing the sizeof gap between maximum and minimu
6. To exit or close the app click on admin and this logs ypu out and locks the data access.
7. This end the exploration of the app.


## 5. Pending Issues

1. More test cases have to be implementted
2. Data access is limited to 15 tmes by the source API. Hence the data is saved in json for use if more than 15 access times is needed in a day.
3. Security and Authentication

 ## End