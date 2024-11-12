import wixData from 'wix-data';
import wixUsers from 'wix-users';
import { currentMember } from "wix-members-frontend";
import { myUpdateMember, encryptCardDigits } from 'backend/accountSettings.web'

$w.onReady(async function () {
    const usermember = await currentMember.getMember();

    // Event listeners for input changes
    $w("#firstNameInput").onChange(enableChange);
    $w("#lastNameInput").onChange(enableChange);
    $w("#birthdateInput").onChange(enableChange);
    $w("#phoneInput").onChange(enableChange);
    $w("#addressInput").onChange(enableChange);

    // Add an onChange event listener to the payment type field
    $w("#paymentTypeInput").onChange(() => {
        const paymentTypeValue = $w("#paymentTypeInput").value;

        if (paymentTypeValue) {
            // If payment type is filled, enable relevant fields
            $w("#cardDigitsInput").enable();
            $w("#expiryDateInput").enable();

            $w("#cardDigitsInput").required = true;
            $w("#expiryDateInput").required = true;
        } else {
            // If payment type is not filled, remove the required status
            $w("#cardDigitsInput").disable();
            $w("#expiryDateInput").disable();

            $w("#cardDigitsInput").required = false;
            $w("#expiryDateInput").required = false;
        }
    });

    // Enable book button
    async function enableChange() {
        const firstName = $w("#firstNameInput").value;
        const lastName = $w("#lastNameInput").value;
        const phone = $w("#phoneInput").value;
        const birthdate = ($w("#birthdateInput").value); 
        const address = $w("#addressInput").value;

        // All dropdowns must have a value
        if (firstName && lastName && phone && birthdate && address){
            $w("#InfoSubmitButton").enable()
        }else{
            $w("#InfoSubmitButton").disable()
        }
    }

    $w("#InfoSubmitButton").onClick(async () => {
        const firstName = $w("#firstNameInput").value;
        const lastName = $w("#lastNameInput").value;
        const phone = $w("#phoneInput").value;
        const birthdate = ($w("#birthdateInput").value); 
        const address = $w("#addressInput").value;

        // Preference settings
        const paymentType = $w("#paymentTypeInput").value;
        const cardDigits = $w("#cardDigitsInput").value;
        const expiryDate = $w("#expiryDateInput").value;
        const petComment = $w("#commentInput").value;

        // Encrypt cardDigits
        let encryptedCardDigits = "";

        if (cardDigits) {
            try {
                encryptedCardDigits = await encryptCardDigits(cardDigits);
            } catch (error) {
                console.error("Error encrypting card digits:", error);
                return; // Stop the submission if encryption fails
            }
        }

        // Get the current user's email
        const user = wixUsers.currentUser;
        const email = await user.getEmail();

        // Define the data to insert or update
        const data = { 
            email: email,
            firstName: firstName, 
            lastName: lastName, 
            phone: phone, 
            birthdate: birthdate, 
            address: address, 
            paymentType: paymentType, 
            cardDigits: encryptedCardDigits, 
            expireDate: expiryDate, 
            petComment: petComment 
        };

        console.log(data)

        // Check if a record for this email already exists
        wixData.query("Users")
            .eq("email", email)
            .find()
            .then((result) => {
                if (result.items.length > 0) {
                    // If a record exists, update it
                    const existingRecordId = result.items[0]._id;
                    wixData.update("Users", { ...data, _id: existingRecordId })
                        .then(() => {
                            $w('#text20').show()
                            $w("#text20").html = "<span style='color: green;'>Info updated successfully.</span>";
                            $w("#InfoSubmitButton").disable()
                        })
                        .catch((error) => {
                            console.error("Error updating info:", error);
                            $w("#text20").html = "<span style='color: red;'>Error updating info. Please try again.</span>";
                        });
                } else {
                    // If no record exists, insert a new one
                    wixData.insert("Users", data)
                        .then(() => {
                            $w('#text20').show()
                            $w("#text20").html = "<span style='color: green;'>Info saved successfully.</span>";
                            $w("#InfoSubmitButton").disable()
                        })
                        .catch((error) => {
                            console.error("Error saving info:", error);
                            $w("#text20").html = "<span style='color: red;'>Error saving info. Please try again.</span>";
                        });
                }
            })
            .catch((error) => {
                console.error("Error querying user info:", error);
                $w("#text20").html = "<span style='color: red;'>Error checking existing data. Please try again.</span>";
            });

        // Update in Wix's backend systems (Reference: https://dev.wix.com/docs/velo/api-reference/wix-members-backend/members/update-member$0)
        const nickname = firstName.concat(" ", lastName);

        // Define member parameter
        let member = {
            contactDetails: {
                firstName: firstName,
                lastName: lastName,
                phones: [phone],
                addresses: [address]
            },
            profile: {
                nickname: nickname
            }
        }

        // Update details in backend using myUpdateMember function
        myUpdateMember(usermember._id, member);
    });
});



