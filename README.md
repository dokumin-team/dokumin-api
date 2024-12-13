# Dokumin Backend/API

## Introduction

This backend application provides an API for Dokumin, our Android-based mobile document management system. Dokumin enables users to manage their documents effectively, offering features such as document categorization, OCR scanning, QR Code Scanner and file/folder management. The API ensures seamless communication between the mobile application and the backend system. All user data, including uploaded documents and categorized results, are securely stored in Firestore, while machine learning models for OCR and classification are stored in Cloud Storage for efficient access during processing.

## Tech Stack

-   [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript): A versatile programming language used for implementing backend logic and connecting to Firestore and Cloud Storage.
-   [Node.js](https://nodejs.org/en): A runtime environment that allows JavaScript to be used for server-side development, enabling scalable and efficient API creation.
-   [Express.js](https://expressjs.com/): A fast, minimalist web framework for Node.js, simplifying the development of web applications and APIs.
-   [Firestore](https://firebase.google.com/docs/firestore): A NoSQL serverless database with real-time notification capability, and together with the Firebase ecosystem it greatly simplifies common app development challenges while letting the application developer focus primarily on their business logic and user experience.

## Getting Started

```
npm install

cp .env.example .env

npm run start
```

## Cloud Services

-   [Cloud Run](https://cloud.google.com/compute): A fully managed compute platform for deploying and running scalable containerized applications.
-   [Cloud Storage](https://cloud.google.com/sql): A unified object storage for developers and enterprises, from live data serving to data analytics/ML to data archiving.
-   [Firestore](https://firebase.google.com/docs/firestore): A NoSQL serverless database with real-time notification capability, and together with the Firebase ecosystem it greatly simplifies common app development challenges while letting the application developer focus primarily on their business logic and user experience.

## API Documentation

You can view the documentation postman in [here](https://documenter.getpostman.com/view/37337961/2sAYHxnPG3)

## Contributing

We welcome contributions from the community! Please follow these steps:

1. Fork the repository.
2. Create a new branch: git checkout -b feature/your-feature-name.
3. Commit your changes: git commit -m 'Add some feature'.
4. Push to the branch: git push origin feature/your-feature-name.
5. Open a pull request.

---

## License

Dokumin API is open-source software licensed under the MIT License. See the LICENSE file for details.
