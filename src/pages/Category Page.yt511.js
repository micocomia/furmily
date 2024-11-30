import wixLocation from 'wix-location';
import wixPaidPlans from 'wix-paid-plans';

$w.onReady(async function () {
    let orders = await wixPaidPlans.getCurrentMemberOrders();
    let activePlans = orders.filter(order => order.status == 'ACTIVE');
    let activePlanNames = activePlans.map(order => order.planName)
    console.log("Active Plan Names: ", activePlanNames);

    // If user has an active plan, redicrect to member shopping
    if(activePlanNames.length > 0){
        wixLocation.to("/membershopping");
    }
});