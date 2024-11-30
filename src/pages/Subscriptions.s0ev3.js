import wixPaidPlans from 'wix-paid-plans';

$w.onReady(async function () {

    let orders = await wixPaidPlans.getCurrentMemberOrders();
    let activePlans = orders.filter(order => order.status == 'ACTIVE');
    let activePlanNames = activePlans.map(order => order.planName);

    console.log(activePlanNames)

    // Depending on active plan type, block the select button for plan type
    if (activePlanNames.includes("Small")) {
        // Block "Small" select button
        $w('#smallBox').show()
    }

    if (activePlanNames.includes("Medium")) {
        // Block "Medium" select button
        $w('#mediumBox').show()
    }

    if (activePlanNames.includes("Large")) {
        // Block "Large" select button
        $w('#largeBox').show()
    }

    if (activePlanNames.includes("X-Large")) {
        // Block "X-Large" select button
        $w('#xlargeBox').show()
    }
});
