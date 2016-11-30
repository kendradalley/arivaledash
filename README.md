# Arivale - Mood Component

## About

A simple prototype to showcase the daily mood tracking user flow. User will log in via their Google credentials. User will make a mood selection(happy, okay, unhappy) and submit to the database. Will return a simple chart of daily mood counts, related data for comparison, and recommendations. 

### Themes
- **Data visualization as a way to retain users** After a mood submission, Angular Charts depicts the overall mood for particular day. Mock data from steps and heart rate for comparison.
- **Treat security as your top priority** Set up oAuth to validate API endpoints with JWT token
- **Provide recommendations as reward for tracking inputs** (WIP) Provide generic mental health suggestions to promote self-care (in the long run, personalized suggestions). Mock representation recommending grounding exercises or connect with coach.
- **Create community around actions** (WIP - Dev) Create a bank of inspirational messages from other Arivale users that will be picked at random and be shown to an individual user when they log their mood. Message delivered will be based on type(happy, unhappy, okay).


## Getting Started

* Clone or fork repo
* Run `npm install` to install dependencies
* Run `foreman run nodemon` to run locally


## Technologies Used

    * HTML
    * CSS
    * Bootstrap
    * JavaScript
    * Express
    * MongoDB
    * Mongoose
    * AngularJS
    * Node
    * Body Parser
    * Sattelizer (JWT Auth)
    * Angular Charts (built on d3.js & Chart.js)
