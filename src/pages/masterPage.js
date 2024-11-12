// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/hello-world

$w.onReady(function () {
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});

import wixLocation from 'wix-location';

$w.onReady(function () {
    // Check if we are on the default Account Settings page
    if (wixLocation.path[0] === 'account/settings') { 
        // Redirect to custom Account Settings page
        wixLocation.to("https://www.wix.../copy-of-pets-registration-item/");  // Replace with the URL of your custom page
    }
});



