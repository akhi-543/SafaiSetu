# SafaiSetu: Bridging the Gap for Sustainable Waste Management

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Overview

SafaiSetu is a mobile platform designed to revolutionize waste management in India by connecting waste pickers directly with households and businesses. It aims to:

*   **Empower Waste Pickers:**  Provide fair wages, dignity, and access to a formal platform.
*   **Promote Sustainability:** Encourage recycling and reduce landfill waste through user education and efficient collection.
*   **Leverage AI:**  Optimize waste segregation, route planning, and demand prediction.

This project was conceptualized as part of a solution challenge, focusing on sustainability and addressing UN Sustainable Development Goals.

## Problem Statement

Current waste management systems in India face challenges:

*   **Inefficiencies:** Inconsistent collection, lack of transparency, and recyclable materials ending up in landfills.
*   **Exploitation:** Waste pickers often work in hazardous conditions with low pay and little recognition.
*   **Environmental Harm:** Improper waste disposal contributes to pollution and resource depletion.

## Solution

SafaiSetu offers a mobile platform that:

*   **Directly Connects:** Waste generators (households/businesses) with registered waste pickers, eliminating middlemen.
*   **Ensures Fair Wages:** Transparent pricing and direct in-app payments.
*   **Optimizes with AI:**
    *   Assisted waste segregation (future feature).
    *   Route optimization for waste pickers (future feature).
    *   Demand prediction (future feature).
*   **Provides Real-time Tracking:**  (Future feature - transparency for users and waste pickers).
*   **Engages Users:** Gamification and carbon footprint tracking (future features).

## Key Features (MVP)

*   **User (Waste Generator):**
    *   Registration and profile creation.
    *   Schedule waste pickups (select waste type, quantity, date/time).
    *   Receive notifications about pickup status.
    *   Rate waste pickers and provide feedback.
    * Contact Support
*   **Waste Picker:**
    *   Registration and verification.
    *   Set availability and service area.
    *   Receive and accept/reject pickup requests.
    *   View user location and navigate.
    *   Confirm waste details and mark pickup complete.
    *   Receive payments and view basic earnings.
    * Rate user and provide feedback.
    * Contact support.

## Future Integrations

*   Advanced AI (dynamic pricing, contamination detection).
*   IoT (smart bins, waste level monitoring).
*   Blockchain (traceability, secure transactions).
*   Platform partnerships (e-commerce, government, CSR).
*   Enhanced gamification and reporting.

## Technology Stack

*   **Frontend:** Flutter (cross-platform mobile app development)
*   **Backend:** Firebase (Authentication, Firestore, Cloud Messaging, Cloud Functions)
*   **AI/ML:** Google Cloud Vertex AI, TensorFlow/Keras, AutoML
*   **Mapping:** MapmyIndia API
*   **Database:** Cloud Firestore (NoSQL), Cloud SQL (Relational)
*   **Serverless:** Cloud Run, Cloud Functions
*   **Payment Gateway:** Razorpay/Paytm (Integration)

## Architecture

![Image](https://github.com/user-attachments/assets/376ab82a-166a-4a74-b31d-dfc3fa47e396)

*The architecture utilizes a serverless approach with Firebase and Google Cloud Platform for scalability and efficiency.*

## Getting Started (For Developers)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/akhi-543/SafaiSetu.git
    ```
2.  **Install Dependencies:**
     * Flutter SDK.
    ```bash
     cd SafaiSetu/safai_setu_user_app # Navigate to the user app directory
    flutter pub get

    cd ../safai_setu_picker_app # Navigate to the picker app directory
    flutter pub get
    ```
3.  **Firebase Setup:**
    *   Create a Firebase project and enable the necessary services (Authentication, Firestore, Cloud Functions, Cloud Messaging).
    *   Download the `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) files and place them in the appropriate project directories.
4.  **MapmyIndia API Key:**
    *   Obtain an API key from MapmyIndia.
    *   Add the API key to the project configuration.
5.  **Run the App:**
    ```bash
    flutter run
    ```
    *Do similar procedure for both the apps.

## Project Structure
![Image](https://github.com/user-attachments/assets/a3cb8ee5-836d-4862-983e-b2455bf37f20)
