import * as utilsDate from './dates'

export function getOtpBudget(otp) {

        let currentBudget: number
        if (otp.isAnnual && otp.budgetHistory) {
            var x = otp.budgetHistory.filter(budget => utilsDate.isDateIntervalCompatibleWithNow(budget.datStart, budget.datEnd))[0]
            currentBudget= x ? x.budget : 0
        }
        else {
            currentBudget= (+(otp.budget))
        }

        return currentBudget
}

