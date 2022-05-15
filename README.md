# Currency converter

## Description
- An api that allows you to create a currency, delete and edit a currency
- Allows the user to convert the currency value with existing currencies in the database
- the api uses graph search to get conversions that are not directly linked
- With each search it creates new conversions making the api faster and faster with each search

## Commands

### Test the API
```
    npm run test
```

### Run the API
```
    docker compose up
```

## Documentation

### Swagger link
- https://app.swaggerhub.com/apis/Sandino204/CurrencyApi/1.0.0/

### openApi yaml
- swagger.yaml in the project root has the yaml which was used to create the documentation in swaggerhub so it can be edited and used in other environments

## Use the API

- Create and update the Coins by the /coin route
- Load the first coversion data by the route /conversion/load
- Convert the data by the route /conversion 