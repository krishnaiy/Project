/**
 * Frontend Application Layer
 * Tier 1: HTML5 + JavaScript with Real-time Dynamic Updates
 */

// API Configuration
// use relative paths so that the frontend works whether running locally or
// when the service is deployed behind a custom domain (e.g. Render).
const API_BASE_URL = '/api';

// Debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Format currency
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(value);
}

// Format number
function formatNumber(value, decimals = 1) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

// Initialize Group Premium Calculator
function initGroupCalculator() {
    const inputs = [
        'num_employees', 'avg_salary', 'avg_age', 'avg_service',
        'retirement_age_group', 'benefit_accrual', 'discount_rate',
        'mortality_factor', 'salary_growth', 'admin_cost', 'employer_contrib'
    ];

    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        const slider = document.getElementById(inputId + '_slider');
        const display = document.getElementById(inputId + '_display');

        // Sync input with slider
        input.addEventListener('input', debounce(() => {
            const value = parseFloat(input.value);
            slider.value = value;
            updateDisplay(inputId, value);
            calculateGroupPremium();
        }, 300));

        // Sync slider with input - Real-time update
        slider.addEventListener('input', () => {
            const value = parseFloat(slider.value);
            input.value = value;
            updateDisplay(inputId, value);
        });

        // Trigger calculation when slider stops moving
        slider.addEventListener('change', () => {
            calculateGroupPremium();
        });

        // Initial display update
        updateDisplay(inputId, parseFloat(input.value));
    });

    // Initialize output slider for Annual Premium (reverse calculation)
    const premiumSlider = document.getElementById('annual_premium_slider');
    if (premiumSlider) {
        premiumSlider.addEventListener('input', () => {
            const value = parseFloat(premiumSlider.value);
            document.getElementById('annual_premium_slider_display').textContent = formatCurrency(value);
        });

        premiumSlider.addEventListener('change', () => {
            const targetPremium = parseFloat(premiumSlider.value);
            reverseCalculateGroupPremium(targetPremium);
        });
        
        // Also trigger reverse calculation on input for immediate feedback
        premiumSlider.addEventListener('input', debounce(() => {
            const targetPremium = parseFloat(premiumSlider.value);
            reverseCalculateGroupPremium(targetPremium);
        }, 500));
    }

    // Initial calculation
    calculateGroupPremium();
}

// Initialize Individual Calculator
function initIndividualCalculator() {
    const inputs = [
        'current_age', 'retirement_age', 'current_salary', 'years_service',
        'salary_growth_ind', 'benefit_rate', 'interest_rate',
        'inflation_rate', 'life_expectancy'
    ];

    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        const slider = document.getElementById(inputId + '_slider');
        const display = document.getElementById(inputId + '_display');

        if (slider) {
            // Sync input with slider
            input.addEventListener('input', debounce(() => {
                const value = parseFloat(input.value);
                slider.value = value;
                updateDisplay(inputId, value);
                calculateIndividualProjection();
            }, 300));

            // Sync slider with input - Real-time update
            slider.addEventListener('input', () => {
                const value = parseFloat(slider.value);
                input.value = value;
                updateDisplay(inputId, value);
            });

            // Trigger calculation when slider stops moving
            slider.addEventListener('change', () => {
                calculateIndividualProjection();
            });

            // Initial display update
            updateDisplay(inputId, parseFloat(input.value));
        }
    });

    // Initialize output slider for Monthly Pension (reverse calculation)
    const pensionSlider = document.getElementById('monthly_pension_ind_slider');
    if (pensionSlider) {
        pensionSlider.addEventListener('input', () => {
            const value = parseFloat(pensionSlider.value);
            document.getElementById('monthly_pension_ind_slider_display').textContent = formatCurrency(value);
        });

        pensionSlider.addEventListener('change', () => {
            const targetPension = parseFloat(pensionSlider.value);
            reverseCalculateIndividualPension(targetPension);
        });
    }

    // Initial calculation
    calculateIndividualProjection();
}

// Update display value
function updateDisplay(inputId, value) {
    const display = document.getElementById(inputId + '_display');
    if (!display) return;

    // Format based on field type
    if (inputId.includes('salary') || inputId.includes('contrib')) {
        display.textContent = formatCurrency(value);
    } else if (inputId.includes('rate') || inputId.includes('accrual') || inputId.includes('cost') || 
               inputId.includes('growth') || inputId.includes('inflation')) {
        display.textContent = value.toFixed(1) + '%';
    } else if (inputId === 'mortality_factor') {
        display.textContent = value.toFixed(2);
    } else {
        display.textContent = Math.round(value);
    }
}

// Calculate Group Premium via API
async function calculateGroupPremium() {
    try {
        // Show loading state
        document.getElementById('group-status').innerHTML = '<span class="pulse"></span> Calculating...';

        const data = {
            num_employees: parseFloat(document.getElementById('num_employees').value),
            avg_salary: parseFloat(document.getElementById('avg_salary').value),
            avg_age: parseFloat(document.getElementById('avg_age').value),
            avg_service: parseFloat(document.getElementById('avg_service').value),
            retirement_age_group: parseFloat(document.getElementById('retirement_age_group').value),
            benefit_accrual: parseFloat(document.getElementById('benefit_accrual').value),
            discount_rate: parseFloat(document.getElementById('discount_rate').value),
            mortality_factor: parseFloat(document.getElementById('mortality_factor').value),
            salary_growth: parseFloat(document.getElementById('salary_growth').value),
            admin_cost: parseFloat(document.getElementById('admin_cost').value),
            employer_contrib: parseFloat(document.getElementById('employer_contrib').value)
        };

        const response = await fetch(`${API_BASE_URL}/calculate/group`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            // Update output fields with animation
            updateOutputField('final_salary_out', formatCurrency(result.outputs.final_salary_out));
            updateOutputField('annual_pension_out', formatCurrency(result.outputs.annual_pension_out));
            updateOutputField('monthly_pension_out', formatCurrency(result.outputs.monthly_pension_out));
            updateOutputField('annual_premium_out', formatCurrency(result.outputs.annual_premium_out));
            updateOutputField('monthly_premium_out', formatCurrency(result.outputs.monthly_premium_out));
            updateOutputField('years_to_retirement', formatNumber(result.outputs.years_to_retirement, 1));
            updateOutputField('employer_contribution', formatCurrency(result.outputs.employer_contribution));
            updateOutputField('funding_gap', formatCurrency(result.outputs.funding_gap));

            // Sync output slider position with calculated value
            const premiumSlider = document.getElementById('annual_premium_slider');
            if (premiumSlider) {
                premiumSlider.value = result.outputs.annual_premium_out;
                document.getElementById('annual_premium_slider_display').textContent = formatCurrency(result.outputs.annual_premium_out);
            }

            // Restore status
            document.getElementById('group-status').innerHTML = '<span class="pulse"></span> Live';
        } else {
            console.error('Calculation error:', result.error);
        }
    } catch (error) {
        console.error('API error:', error);
        document.getElementById('group-status').innerHTML = '<span class="pulse"></span> Error';
    }
}

// Calculate Individual Projection via API
async function calculateIndividualProjection() {
    try {
        // Show loading state
        document.getElementById('individual-status').innerHTML = '<span class="pulse"></span> Calculating...';

        const data = {
            current_age: parseFloat(document.getElementById('current_age').value),
            retirement_age: parseFloat(document.getElementById('retirement_age').value),
            current_salary: parseFloat(document.getElementById('current_salary').value),
            years_service: parseFloat(document.getElementById('years_service').value),
            salary_growth_ind: parseFloat(document.getElementById('salary_growth_ind').value),
            benefit_rate: parseFloat(document.getElementById('benefit_rate').value),
            interest_rate: parseFloat(document.getElementById('interest_rate').value),
            inflation_rate: parseFloat(document.getElementById('inflation_rate').value),
            life_expectancy: parseFloat(document.getElementById('life_expectancy').value)
        };

        const response = await fetch(`${API_BASE_URL}/calculate/individual`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            // Update output fields with animation
            updateOutputField('salary_retirement_out', formatCurrency(result.outputs.salary_retirement_out));
            updateOutputField('monthly_pension_ind_out', formatCurrency(result.outputs.monthly_pension_ind_out));
            updateOutputField('annual_pension_ind_out', formatCurrency(result.outputs.annual_pension_ind_out));
            updateOutputField('replacement_ratio_out', formatNumber(result.outputs.replacement_ratio_out, 1) + '%');
            updateOutputField('lifetime_pension_out', formatCurrency(result.outputs.lifetime_pension_out));
            updateOutputField('years_to_retirement_ind', formatNumber(result.outputs.years_to_retirement, 1));
            updateOutputField('total_service_years', formatNumber(result.outputs.total_service_years, 1));
            updateOutputField('pv_today', formatCurrency(result.outputs.pv_today));
            updateOutputField('real_monthly_pension', formatCurrency(result.outputs.real_monthly_pension));

            // Sync output slider position with calculated value
            const pensionSlider = document.getElementById('monthly_pension_ind_slider');
            if (pensionSlider) {
                pensionSlider.value = result.outputs.monthly_pension_ind_out;
                document.getElementById('monthly_pension_ind_slider_display').textContent = formatCurrency(result.outputs.monthly_pension_ind_out);
            }

            // Restore status
            document.getElementById('individual-status').innerHTML = '<span class="pulse"></span> Live';
        } else {
            console.error('Calculation error:', result.error);
        }
    } catch (error) {
        console.error('API error:', error);
        document.getElementById('individual-status').innerHTML = '<span class="pulse"></span> Error';
    }
}

// Update output field with animation
function updateOutputField(fieldId, value) {
    const element = document.getElementById(fieldId);
    if (element) {
        element.style.transition = 'all 0.3s ease';
        element.style.transform = 'scale(1.05)';
        element.textContent = value;
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 300);
    }
}

// Reverse Calculate Group Premium
async function reverseCalculateGroupPremium(targetPremium) {
    try {
        document.getElementById('group-status').innerHTML = '<span class="pulse"></span> Reverse Calculating...';

        const data = {
            target_annual_premium: targetPremium,
            num_employees: parseFloat(document.getElementById('num_employees').value),
            avg_salary: parseFloat(document.getElementById('avg_salary').value),
            avg_age: parseFloat(document.getElementById('avg_age').value),
            avg_service: parseFloat(document.getElementById('avg_service').value),
            retirement_age_group: parseFloat(document.getElementById('retirement_age_group').value),
            benefit_accrual: parseFloat(document.getElementById('benefit_accrual').value),
            discount_rate: parseFloat(document.getElementById('discount_rate').value),
            mortality_factor: parseFloat(document.getElementById('mortality_factor').value),
            salary_growth: parseFloat(document.getElementById('salary_growth').value),
            admin_cost: parseFloat(document.getElementById('admin_cost').value),
            employer_contrib: parseFloat(document.getElementById('employer_contrib').value)
        };

        const response = await fetch(`${API_BASE_URL}/reverse/group`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success && result.adjusted_inputs) {
            // Update the adjusted input field
            if (result.adjusted_inputs.benefit_accrual !== undefined) {
                document.getElementById('benefit_accrual').value = result.adjusted_inputs.benefit_accrual;
                document.getElementById('benefit_accrual_slider').value = result.adjusted_inputs.benefit_accrual;
                updateDisplay('benefit_accrual', result.adjusted_inputs.benefit_accrual);
                
                // Link to individual calculator - update benefit_rate to match
                document.getElementById('benefit_rate').value = result.adjusted_inputs.benefit_accrual;
                document.getElementById('benefit_rate_slider').value = result.adjusted_inputs.benefit_accrual;
                updateDisplay('benefit_rate', result.adjusted_inputs.benefit_accrual);
            }
            
            // Recalculate both calculators to show all updated values
            calculateGroupPremium();
            calculateIndividualProjection();
        }

        document.getElementById('group-status').innerHTML = '<span class="pulse"></span> Live';
    } catch (error) {
        console.error('Reverse calculation error:', error);
        document.getElementById('group-status').innerHTML = '<span class="pulse"></span> Error';
    }
}

// Reverse Calculate Individual Pension
async function reverseCalculateIndividualPension(targetPension) {
    try {
        document.getElementById('individual-status').innerHTML = '<span class="pulse"></span> Reverse Calculating...';

        const data = {
            target_monthly_pension: targetPension,
            current_age: parseFloat(document.getElementById('current_age').value),
            retirement_age: parseFloat(document.getElementById('retirement_age').value),
            current_salary: parseFloat(document.getElementById('current_salary').value),
            years_service: parseFloat(document.getElementById('years_service').value),
            salary_growth_ind: parseFloat(document.getElementById('salary_growth_ind').value),
            benefit_rate: parseFloat(document.getElementById('benefit_rate').value),
            interest_rate: parseFloat(document.getElementById('interest_rate').value),
            inflation_rate: parseFloat(document.getElementById('inflation_rate').value),
            life_expectancy: parseFloat(document.getElementById('life_expectancy').value)
        };

        const response = await fetch(`${API_BASE_URL}/reverse/individual`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success && result.adjusted_inputs) {
            // Update the adjusted input field
            if (result.adjusted_inputs.benefit_rate !== undefined) {
                document.getElementById('benefit_rate').value = result.adjusted_inputs.benefit_rate;
                document.getElementById('benefit_rate_slider').value = result.adjusted_inputs.benefit_rate;
                updateDisplay('benefit_rate', result.adjusted_inputs.benefit_rate);
            }
            
            // Recalculate to show all updated values
            calculateIndividualProjection();
        }

        document.getElementById('individual-status').innerHTML = '<span class="pulse"></span> Live';
    } catch (error) {
        console.error('Reverse calculation error:', error);
        document.getElementById('individual-status').innerHTML = '<span class="pulse"></span> Error';
    }
}

// Check API health
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const result = await response.json();
        document.getElementById('api-health').textContent = result.status === 'healthy' ? '✓ Connected' : '✗ Disconnected';
        document.getElementById('api-health').style.color = result.status === 'healthy' ? 'var(--success-color)' : 'var(--warning-color)';
    } catch (error) {
        document.getElementById('api-health').textContent = '✗ Disconnected';
        document.getElementById('api-health').style.color = 'var(--warning-color)';
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Pension Calculator Frontend Initialized');
    console.log('📊 Three-Tier Architecture Active');
    
    initGroupCalculator();
    initIndividualCalculator();
    checkAPIHealth();
    
    // Check API health every 30 seconds
    setInterval(checkAPIHealth, 30000);
});
