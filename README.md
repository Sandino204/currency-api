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
- swagger.yaml na raiz do projeto possui o yaml que foi usado para criar a documentação no swaggerhub para poder ser editada e usada em outros ambientes

## Use the API

- Create and update the Coins by the /coin route
- Load the first coversion data by the route /conversion/load
- Convert the data by the route /conversion 