document.addEventListener('DOMContentLoaded', function() {
    const reportType = document.getElementById('reportType');
    const timePeriod = document.getElementById('timePeriod');
    const departmentFilter = document.getElementById('departmentFilter');
    const generateReportBtn = document.getElementById('generateReport');
    const exportReportBtn = document.getElementById('exportReport');
    const customDateRange = document.getElementById('customDateRange');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const reportOutput = document.getElementById('reportOutput');
    const summaryCards = document.getElementById('summaryCards');
    const chartContainer = document.getElementById('chartContainer');
    let reportChart = null;

    // Set default dates for custom range
    const today = new Date();
    endDate.valueAsDate = today;
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startDate.valueAsDate = firstDayOfMonth;

    // Show/hide custom date range
    timePeriod.addEventListener('change', function() {
        customDateRange.style.display = this.value === 'custom' ? 'flex' : 'none';
    });

    // Generate report when button is clicked
    generateReportBtn.addEventListener('click', generateReport);

    // Export report functionality
    exportReportBtn.addEventListener('click', exportReport);

    function generateReport() {
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const selectedReportType = reportType.value;
        const selectedTimePeriod = timePeriod.value;
        const selectedDepartment = departmentFilter.value;
        
        // Filter transactions based on time period
        let filteredTransactions = filterByTimePeriod(transactions, selectedTimePeriod);
        
        // Filter by department if needed
        if (selectedDepartment !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.department === selectedDepartment);
        }
        
        // Generate report based on type
        switch (selectedReportType) {
            case 'profit_loss':
                generateProfitLossReport(filteredTransactions, selectedDepartment);
                break;
            case 'cashflow':
                generateCashFlowReport(filteredTransactions, selectedDepartment);
                break;
            case 'departmental':
                generateDepartmentalReport(filteredTransactions);
                break;
        }
        
        // Enable export button
        exportReportBtn.disabled = false;
    }

    function filterByTimePeriod(transactions, period) {
        const now = new Date();
        let start, end;
        
        switch (period) {
            case 'this_month':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'last_month':
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                end = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'this_quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                start = new Date(now.getFullYear(), quarter * 3, 1);
                end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
                break;
            case 'this_year':
                start = new Date(now.getFullYear(), 0, 1);
                end = new Date(now.getFullYear(), 11, 31);
                break;
            case 'custom':
                start = new Date(startDate.value);
                end = new Date(endDate.value);
                break;
            default: // 'all'
                return transactions;
        }
        
        return transactions.filter(t => {
            const transactionDate = new Date(t.dueDate);
            return transactionDate >= start && transactionDate <= end;
        });
    }

    function generateProfitLossReport(transactions, department) {
        // Calculate totals
        const income = transactions
            .filter(t => t.type === 'Incoming')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expenses = transactions
            .filter(t => t.type === 'Outgoing')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const profit = income - expenses;
        
        // Update summary cards
        summaryCards.innerHTML = `
            <div class="summary-card income">
                <h3>Total Income</h3>
                <div class="value">$${income.toFixed(2)}</div>
                <div>From ${transactions.filter(t => t.type === 'Incoming').length} transactions</div>
            </div>
            <div class="summary-card expenses">
                <h3>Total Expenses</h3>
                <div class="value">$${expenses.toFixed(2)}</div>
                <div>From ${transactions.filter(t => t.type === 'Outgoing').length} transactions</div>
            </div>
            <div class="summary-card profit">
                <h3>Net Profit</h3>
                <div class="value ${profit >= 0 ? 'positive' : 'negative'}">$${Math.abs(profit).toFixed(2)}</div>
                <div>${profit >= 0 ? 'Profit' : 'Loss'}</div>
            </div>
        `;
        
        // Generate detailed report
        let reportHTML = `
            <h2>${department === 'all' ? 'Organization' : department} Profit & Loss Report</h2>
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>% of Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Total Income</td>
                        <td>$${income.toFixed(2)}</td>
                        <td>100%</td>
                    </tr>
                    <tr>
                        <td>Total Expenses</td>
                        <td>$${expenses.toFixed(2)}</td>
                        <td>${income > 0 ? (expenses / income * 100).toFixed(1) + '%' : 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>Net Profit/Loss</strong></td>
                        <td><strong class="${profit >= 0 ? 'positive' : 'negative'}">$${Math.abs(profit).toFixed(2)}</strong></td>
                        <td><strong>${income > 0 ? (profit / income * 100).toFixed(1) + '%' : 'N/A'}</strong></td>
                    </tr>
                </tbody>
            </table>
        `;
        
        // Add department breakdown if viewing all departments
        if (department === 'all') {
            reportHTML += generateDepartmentalBreakdown(transactions);
        }
        
        reportOutput.innerHTML = reportHTML;
        
        // Generate chart
        generateChart(['Income', 'Expenses', 'Profit'], [income, expenses, profit]);
    }

    function generateCashFlowReport(transactions, department) {
        // Group by month
        const monthlyData = {};
        
        transactions.forEach(t => {
            const date = new Date(t.dueDate);
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyData[monthYear]) {
                monthlyData[monthYear] = {
                    income: 0,
                    expenses: 0,
                    date: date
                };
            }
            
            if (t.type === 'Incoming') {
                monthlyData[monthYear].income += t.amount;
            } else {
                monthlyData[monthYear].expenses += t.amount;
            }
        });
        
        // Sort by date
        const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
            return new Date(monthlyData[a].date) - new Date(monthlyData[b].date);
        });
        
        // Generate table
        let tableHTML = `
            <h2>${department === 'all' ? 'Organization' : department} Cash Flow Report</h2>
            <table>
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Income</th>
                        <th>Expenses</th>
                        <th>Net Cash Flow</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        sortedMonths.forEach(month => {
            const data = monthlyData[month];
            const net = data.income - data.expenses;
            const monthName = data.date.toLocaleString('default', { month: 'short', year: 'numeric' });
            
            tableHTML += `
                <tr>
                    <td>${monthName}</td>
                    <td>$${data.income.toFixed(2)}</td>
                    <td>$${data.expenses.toFixed(2)}</td>
                    <td class="${net >= 0 ? 'positive' : 'negative'}">$${Math.abs(net).toFixed(2)}</td>
                </tr>
            `;
        });
        
        // Add totals
        const totalIncome = sortedMonths.reduce((sum, month) => sum + monthlyData[month].income, 0);
        const totalExpenses = sortedMonths.reduce((sum, month) => sum + monthlyData[month].expenses, 0);
        const totalNet = totalIncome - totalExpenses;
        
        tableHTML += `
                <tr>
                    <td><strong>Total</strong></td>
                    <td><strong>$${totalIncome.toFixed(2)}</strong></td>
                    <td><strong>$${totalExpenses.toFixed(2)}</strong></td>
                    <td><strong class="${totalNet >= 0 ? 'positive' : 'negative'}">$${Math.abs(totalNet).toFixed(2)}</strong></td>
                </tr>
            </tbody>
        </table>
        `;
        
        reportOutput.innerHTML = tableHTML;
        
        // Generate chart
        const labels = sortedMonths.map(month => {
            return new Date(monthlyData[month].date).toLocaleString('default', { month: 'short', year: '2-digit' });
        });
        
        const incomeData = sortedMonths.map(month => monthlyData[month].income);
        const expensesData = sortedMonths.map(month => monthlyData[month].expenses);
        const netData = sortedMonths.map(month => monthlyData[month].income - monthlyData[month].expenses);
        
        generateChart(labels, incomeData, expensesData, netData);
    }

    function generateDepartmentalReport(transactions) {
        // Group by department
        const departments = ['HR', 'IT', 'MARKETING', 'FINANCE'];
        const departmentData = {};
        
        departments.forEach(dept => {
            departmentData[dept] = {
                income: 0,
                expenses: 0,
                transactions: 0
            };
        });
        
        transactions.forEach(t => {
            if (t.type === 'Incoming') {
                departmentData[t.department].income += t.amount;
            } else {
                departmentData[t.department].expenses += t.amount;
            }
            departmentData[t.department].transactions++;
        });
        
        // Generate table
        let tableHTML = `
            <h2>Departmental Financial Report</h2>
            <table>
                <thead>
                    <tr>
                        <th>Department</th>
                        <th>Income</th>
                        <th>Expenses</th>
                        <th>Net</th>
                        <th>Transactions</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        departments.forEach(dept => {
            const data = departmentData[dept];
            const net = data.income - data.expenses;
            
            tableHTML += `
                <tr>
                    <td>${dept}</td>
                    <td>$${data.income.toFixed(2)}</td>
                    <td>$${data.expenses.toFixed(2)}</td>
                    <td class="${net >= 0 ? 'positive' : 'negative'}">$${Math.abs(net).toFixed(2)}</td>
                    <td>${data.transactions}</td>
                </tr>
            `;
        });
        
        // Add totals
        const totalIncome = departments.reduce((sum, dept) => sum + departmentData[dept].income, 0);
        const totalExpenses = departments.reduce((sum, dept) => sum + departmentData[dept].expenses, 0);
        const totalNet = totalIncome - totalExpenses;
        const totalTransactions = departments.reduce((sum, dept) => sum + departmentData[dept].transactions, 0);
        
        tableHTML += `
                <tr>
                    <td><strong>Total</strong></td>
                    <td><strong>$${totalIncome.toFixed(2)}</strong></td>
                    <td><strong>$${totalExpenses.toFixed(2)}</strong></td>
                    <td><strong class="${totalNet >= 0 ? 'positive' : 'negative'}">$${Math.abs(totalNet).toFixed(2)}</strong></td>
                    <td><strong>${totalTransactions}</strong></td>
                </tr>
            </tbody>
        </table>
        `;
        
        reportOutput.innerHTML = tableHTML;
        
        // Generate summary cards
        summaryCards.innerHTML = `
            <div class="summary-card income">
                <h3>Total Income</h3>
                <div class="value">$${totalIncome.toFixed(2)}</div>
                <div>From ${transactions.filter(t => t.type === 'Incoming').length} transactions</div>
            </div>
            <div class="summary-card expenses">
                <h3>Total Expenses</h3>
                <div class="value">$${totalExpenses.toFixed(2)}</div>
                <div>From ${transactions.filter(t => t.type === 'Outgoing').length} transactions</div>
            </div>
            <div class="summary-card profit">
                <h3>Net Profit</h3>
                <div class="value ${totalNet >= 0 ? 'positive' : 'negative'}">$${Math.abs(totalNet).toFixed(2)}</div>
                <div>${totalNet >= 0 ? 'Profit' : 'Loss'}</div>
            </div>
        `;
        
        // Generate chart
        generateChart(
            departments,
            departments.map(dept => departmentData[dept].income),
            departments.map(dept => departmentData[dept].expenses)
        );
    }

    function generateDepartmentalBreakdown(transactions) {
        const departments = ['HR', 'IT', 'MARKETING', 'FINANCE'];
        let html = '<h3>Departmental Breakdown</h3><table><thead><tr><th>Department</th><th>Income</th><th>Expenses</th><th>Net</th></tr></thead><tbody>';
        
        departments.forEach(dept => {
            const deptTransactions = transactions.filter(t => t.department === dept);
            const income = deptTransactions.filter(t => t.type === 'Incoming').reduce((sum, t) => sum + t.amount, 0);
            const expenses = deptTransactions.filter(t => t.type === 'Outgoing').reduce((sum, t) => sum + t.amount, 0);
            const net = income - expenses;
            
            html += `
                <tr>
                    <td>${dept}</td>
                    <td>$${income.toFixed(2)}</td>
                    <td>$${expenses.toFixed(2)}</td>
                    <td class="${net >= 0 ? 'positive' : 'negative'}">$${Math.abs(net).toFixed(2)}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        return html;
    }

    function generateChart(labels, incomeData, expensesData, netData) {
        chartContainer.style.display = 'block';
        
        // Destroy previous chart if exists
        if (reportChart) {
            reportChart.destroy();
        }
        
        const ctx = document.getElementById('reportChart').getContext('2d');
        
        if (reportType.value === 'cashflow') {
            // Cash flow chart (line chart)
            reportChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Income',
                            data: incomeData,
                            borderColor: '#28a745',
                            backgroundColor: 'rgba(40, 167, 69, 0.1)',
                            borderWidth: 3,
                            tension: 0.4,
                            fill: true,
                            pointBackgroundColor: '#28a745',
                            pointRadius: 5,
                            pointHoverRadius: 8
                        },
                        {
                            label: 'Expenses',
                            data: expensesData,
                            borderColor: '#dc3545',
                            backgroundColor: 'rgba(220, 53, 69, 0.1)',
                            borderWidth: 3,
                            tension: 0.4,
                            fill: true,
                            pointBackgroundColor: '#dc3545',
                            pointRadius: 5,
                            pointHoverRadius: 8
                        },
                        {
                            label: 'Net Cash Flow',
                            data: netData,
                            borderColor: '#17a2b8',
                            backgroundColor: 'rgba(23, 162, 184, 0.1)',
                            borderWidth: 3,
                            tension: 0.4,
                            fill: true,
                            pointBackgroundColor: '#17a2b8',
                            pointRadius: 5,
                            pointHoverRadius: 8
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Cash Flow Over Time',
                            font: {
                                size: 16
                            }
                        },
                        legend: {
                            position: 'top',
                            labels: {
                                boxWidth: 12,
                                padding: 20
                            }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            title: {
                                display: true,
                                text: 'Amount ($)'
                            },
                            grid: {
                                drawBorder: false
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Month'
                            },
                            grid: {
                                display: false
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'nearest'
                    }
                }
            });
        } else {
            // Profit/Loss or Departmental chart (bar chart)
            const datasets = [];
            
            if (incomeData) {
                datasets.push({
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: '#28a745',
                    borderColor: '#28a745',
                    borderWidth: 1
                });
            }
            
            if (expensesData) {
                datasets.push({
                    label: 'Expenses',
                    data: expensesData,
                    backgroundColor: '#dc3545',
                    borderColor: '#dc3545',
                    borderWidth: 1
                });
            }
            
            reportChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: reportType.value === 'profit_loss' ? 'Profit & Loss' : 'Departmental Performance',
                            font: {
                                size: 16
                            }
                        },
                        legend: {
                            position: 'top',
                            labels: {
                                boxWidth: 12,
                                padding: 20
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Amount ($)'
                            }
                        }
                    }
                }
            });
        }
    }

    function exportReport() {
        const table = reportOutput.querySelector('table');
        if (!table) {
            alert('No report data to export');
            return;
        }
        
        let csv = [];
        const rows = table.querySelectorAll('tr');
        
        rows.forEach(row => {
            const rowData = [];
            const cells = row.querySelectorAll('th, td');
            
            cells.forEach(cell => {
                let text = cell.textContent.replace(/\$/g, '').trim();
                text = text.replace(/<[^>]*>/g, '');
                rowData.push(`"${text}"`);
            });
            
            csv.push(rowData.join(','));
        });
        
        const csvContent = csv.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.setAttribute('href', url);
        link.setAttribute('download', `financial_report_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});