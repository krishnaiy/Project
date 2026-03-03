"""
Backend Calculation Engine for Pension Calculator
Tier 3: Business Logic Layer
"""
import math


class PensionCalculator:
    """Backend calculation engine for defined benefits pension"""
    
    @staticmethod
    def calculate_group_premium(data):
        """Calculate group premium based on input parameters"""
        try:
            # Extract input parameters
            num_employees = float(data.get('num_employees', 50))
            avg_salary = float(data.get('avg_salary', 60000))
            avg_age = float(data.get('avg_age', 40))
            avg_service = float(data.get('avg_service', 10))
            retirement_age = float(data.get('retirement_age_group', 65))
            benefit_accrual = float(data.get('benefit_accrual', 1.5)) / 100
            discount_rate = float(data.get('discount_rate', 7.0)) / 100
            mortality_factor = float(data.get('mortality_factor', 0.95))
            salary_growth = float(data.get('salary_growth', 3.0)) / 100
            admin_cost = float(data.get('admin_cost', 5.0)) / 100
            employer_contrib = float(data.get('employer_contrib', 12.0)) / 100
            
            # Calculate years to retirement
            years_to_retirement = max(1, retirement_age - avg_age)
            
            # Project final average salary at retirement
            final_salary = avg_salary * math.pow(1 + salary_growth, years_to_retirement)
            
            # Total service years at retirement
            total_service = avg_service + years_to_retirement
            
            # Annual pension benefit
            annual_pension = benefit_accrual * total_service * final_salary
            monthly_pension = annual_pension / 12
            
            # Present value calculations
            pension_payment_years = 20
            pv_factor = (1 - math.pow(1 + discount_rate, -pension_payment_years)) / discount_rate
            present_value_benefit = annual_pension * pv_factor * mortality_factor
            present_value_liability = present_value_benefit / math.pow(1 + discount_rate, years_to_retirement)
            
            # Annual premium needed
            annual_premium_per_employee = present_value_liability / max(1, years_to_retirement)
            total_annual_premium = annual_premium_per_employee * num_employees
            total_premium_with_admin = total_annual_premium * (1 + admin_cost)
            monthly_premium_total = total_premium_with_admin / 12
            
            # Employer contribution
            employer_annual_contribution = avg_salary * employer_contrib * num_employees
            funding_gap = total_premium_with_admin - employer_annual_contribution
            
            return {
                'success': True,
                'outputs': {
                    'final_salary_out': round(final_salary, 2),
                    'annual_pension_out': round(annual_pension, 2),
                    'monthly_pension_out': round(monthly_pension, 2),
                    'annual_premium_out': round(total_premium_with_admin, 2),
                    'monthly_premium_out': round(monthly_premium_total, 2),
                    'years_to_retirement': round(years_to_retirement, 1),
                    'total_service': round(total_service, 1),
                    'present_value_liability': round(present_value_liability, 2),
                    'employer_contribution': round(employer_annual_contribution, 2),
                    'funding_gap': round(funding_gap, 2)
                }
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def reverse_calculate_group(data):
        """Reverse calculate inputs based on desired premium output"""
        try:
            # Get target output and what to adjust
            target_premium = float(data.get('target_annual_premium', 0))
            
            # Get current inputs
            num_employees = float(data.get('num_employees', 50))
            avg_salary = float(data.get('avg_salary', 60000))
            avg_age = float(data.get('avg_age', 40))
            avg_service = float(data.get('avg_service', 10))
            retirement_age = float(data.get('retirement_age_group', 65))
            benefit_accrual = float(data.get('benefit_accrual', 1.5)) / 100
            discount_rate = float(data.get('discount_rate', 7.0)) / 100
            mortality_factor = float(data.get('mortality_factor', 0.95))
            salary_growth = float(data.get('salary_growth', 3.0)) / 100
            admin_cost = float(data.get('admin_cost', 5.0)) / 100
            employer_contrib = float(data.get('employer_contrib', 12.0)) / 100
            
            # Reverse calculate: adjust benefit_accrual to meet target premium
            # Using iterative approach to find the right benefit accrual rate
            years_to_retirement = max(1, retirement_age - avg_age)
            final_salary = avg_salary * math.pow(1 + salary_growth, years_to_retirement)
            total_service = avg_service + years_to_retirement
            
            # Calculate what benefit accrual rate would give us the target premium
            pension_payment_years = 20
            pv_factor = (1 - math.pow(1 + discount_rate, -pension_payment_years)) / discount_rate
            
            # Work backwards from target premium
            target_premium_base = target_premium / (1 + admin_cost)
            target_liability_per_employee = target_premium_base * years_to_retirement / num_employees
            target_pv_benefit = target_liability_per_employee * math.pow(1 + discount_rate, years_to_retirement)
            target_annual_pension = target_pv_benefit / (pv_factor * mortality_factor)
            
            # Calculate required benefit accrual rate
            new_benefit_accrual = (target_annual_pension / (total_service * final_salary)) * 100
            new_benefit_accrual = max(0.5, min(5.0, new_benefit_accrual))  # Clamp between 0.5% and 5%
            
            return {
                'success': True,
                'adjusted_inputs': {
                    'benefit_accrual': round(new_benefit_accrual, 2)
                }
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def calculate_individual_projection(data):
        """Calculate individual benefit projection"""
        try:
            # Extract input parameters
            current_age = float(data.get('current_age', 35))
            retirement_age = float(data.get('retirement_age', 65))
            current_salary = float(data.get('current_salary', 75000))
            years_service = float(data.get('years_service', 8))
            salary_growth = float(data.get('salary_growth_ind', 3.5)) / 100
            benefit_rate = float(data.get('benefit_rate', 1.5)) / 100
            interest_rate = float(data.get('interest_rate', 6.5)) / 100
            inflation_rate = float(data.get('inflation_rate', 2.5)) / 100
            life_expectancy = float(data.get('life_expectancy', 85))
            
            # Calculate years to retirement
            years_to_retirement = max(1, retirement_age - current_age)
            
            # Project salary at retirement
            salary_at_retirement = current_salary * math.pow(1 + salary_growth, years_to_retirement)
            
            # Total years of service at retirement
            total_service_years = years_service + years_to_retirement
            
            # Calculate annual pension benefit
            annual_pension_benefit = salary_at_retirement * benefit_rate * total_service_years
            monthly_pension_benefit = annual_pension_benefit / 12
            
            # Calculate pension payment period
            pension_years = max(1, life_expectancy - retirement_age)
            
            # Total lifetime pension
            total_lifetime_pension = annual_pension_benefit * pension_years
            
            # Replacement ratio
            replacement_ratio = (annual_pension_benefit / salary_at_retirement) * 100 if salary_at_retirement > 0 else 0
            
            # Present value calculations
            pv_factor = (1 - math.pow(1 + interest_rate, -pension_years)) / interest_rate
            pv_pension_at_retirement = annual_pension_benefit * pv_factor
            pv_pension_today = pv_pension_at_retirement / math.pow(1 + interest_rate, years_to_retirement)
            
            # Real monthly pension (adjusted for inflation)
            real_monthly_pension = monthly_pension_benefit / math.pow(1 + inflation_rate, years_to_retirement)
            
            return {
                'success': True,
                'outputs': {
                    'salary_retirement_out': round(salary_at_retirement, 2),
                    'monthly_pension_ind_out': round(monthly_pension_benefit, 2),
                    'annual_pension_ind_out': round(annual_pension_benefit, 2),
                    'replacement_ratio_out': round(replacement_ratio, 2),
                    'lifetime_pension_out': round(total_lifetime_pension, 2),
                    'years_to_retirement': round(years_to_retirement, 1),
                    'total_service_years': round(total_service_years, 1),
                    'pension_years': round(pension_years, 1),
                    'pv_at_retirement': round(pv_pension_at_retirement, 2),
                    'pv_today': round(pv_pension_today, 2),
                    'real_monthly_pension': round(real_monthly_pension, 2)
                }
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def reverse_calculate_individual(data):
        """Reverse calculate inputs based on desired pension output"""
        try:
            # Get target output
            target_monthly_pension = float(data.get('target_monthly_pension', 0))
            
            # Get current inputs
            current_age = float(data.get('current_age', 35))
            retirement_age = float(data.get('retirement_age', 65))
            current_salary = float(data.get('current_salary', 75000))
            years_service = float(data.get('years_service', 8))
            salary_growth = float(data.get('salary_growth_ind', 3.5)) / 100
            benefit_rate = float(data.get('benefit_rate', 1.5)) / 100
            interest_rate = float(data.get('interest_rate', 6.5)) / 100
            inflation_rate = float(data.get('inflation_rate', 2.5)) / 100
            life_expectancy = float(data.get('life_expectancy', 85))
            
            # Calculate current projections
            years_to_retirement = max(1, retirement_age - current_age)
            salary_at_retirement = current_salary * math.pow(1 + salary_growth, years_to_retirement)
            total_service_years = years_service + years_to_retirement
            
            # Reverse calculate: adjust benefit_rate to achieve target monthly pension
            target_annual_pension = target_monthly_pension * 12
            new_benefit_rate = (target_annual_pension / (salary_at_retirement * total_service_years)) * 100
            new_benefit_rate = max(0.5, min(5.0, new_benefit_rate))  # Clamp between 0.5% and 5%
            
            return {
                'success': True,
                'adjusted_inputs': {
                    'benefit_rate': round(new_benefit_rate, 2)
                }
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
