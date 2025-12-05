// Enhanced Attendance Calculator Application with Manual Calculator
class AttendanceCalculator {
    constructor() {
        this.students = [];
        this.currentView = 'dashboard';
        this.currentEditingStudent = null;
        this.sortOrder = { column: null, ascending: true };
        this.confirmCallback = null;
        this.calculationHistory = [];
        
        // Ensure proper initialization
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => this.initializeApp(), 100);
            });
        } else {
            setTimeout(() => this.initializeApp(), 100);
        }
    }

    initializeApp() {
        try {
            console.log('Initializing Attendance Calculator...');
            this.loadData();
            this.setupEventListeners();
            this.switchView('dashboard'); // Explicitly set dashboard as active
            this.updateDashboard();
            console.log('Application initialized successfully');
        } catch (error) {
            console.error('Error initializing application:', error);
        }
    }

    // Data Management
    loadData() {
        try {
            const savedStudents = localStorage.getItem('attendance-students');
            const savedHistory = localStorage.getItem('calculation-history');
            
            if (savedStudents) {
                this.students = JSON.parse(savedStudents);
            } else {
                // Load sample data if no saved data exists
                this.students = [
                    {
                        "id": "1",
                        "name": "Alice Johnson",
                        "studentId": "STU001",
                        "class": "10A",
                        "attendanceRecords": [
                            {"date": "2025-09-01", "status": "present"},
                            {"date": "2025-09-02", "status": "present"},
                            {"date": "2025-09-03", "status": "absent"},
                            {"date": "2025-09-04", "status": "present"},
                            {"date": "2025-09-05", "status": "late"},
                            {"date": "2025-09-06", "status": "present"},
                            {"date": "2025-09-07", "status": "present"},
                            {"date": "2025-09-08", "status": "present"},
                            {"date": "2025-09-09", "status": "absent"},
                            {"date": "2025-09-10", "status": "present"}
                        ]
                    },
                    {
                        "id": "2", 
                        "name": "Bob Smith",
                        "studentId": "STU002",
                        "class": "10A",
                        "attendanceRecords": [
                            {"date": "2025-09-01", "status": "present"},
                            {"date": "2025-09-02", "status": "absent"},
                            {"date": "2025-09-03", "status": "absent"},
                            {"date": "2025-09-04", "status": "present"},
                            {"date": "2025-09-05", "status": "absent"},
                            {"date": "2025-09-06", "status": "absent"},
                            {"date": "2025-09-07", "status": "present"},
                            {"date": "2025-09-08", "status": "absent"},
                            {"date": "2025-09-09", "status": "present"},
                            {"date": "2025-09-10", "status": "absent"}
                        ]
                    },
                    {
                        "id": "3",
                        "name": "Carol Davis",
                        "studentId": "STU003", 
                        "class": "10B",
                        "attendanceRecords": [
                            {"date": "2025-09-01", "status": "present"},
                            {"date": "2025-09-02", "status": "present"},
                            {"date": "2025-09-03", "status": "present"},
                            {"date": "2025-09-04", "status": "present"},
                            {"date": "2025-09-05", "status": "present"},
                            {"date": "2025-09-06", "status": "late"},
                            {"date": "2025-09-07", "status": "present"},
                            {"date": "2025-09-08", "status": "present"},
                            {"date": "2025-09-09", "status": "present"},
                            {"date": "2025-09-10", "status": "present"}
                        ]
                    },
                    {
                        "id": "4",
                        "name": "David Wilson",
                        "studentId": "STU004",
                        "class": "10B",
                        "attendanceRecords": [
                            {"date": "2025-09-01", "status": "late"},
                            {"date": "2025-09-02", "status": "present"},
                            {"date": "2025-09-03", "status": "absent"},
                            {"date": "2025-09-04", "status": "absent"},
                            {"date": "2025-09-05", "status": "absent"},
                            {"date": "2025-09-06", "status": "absent"},
                            {"date": "2025-09-07", "status": "absent"},
                            {"date": "2025-09-08", "status": "present"},
                            {"date": "2025-09-09", "status": "absent"},
                            {"date": "2025-09-10", "status": "absent"}
                        ]
                    }
                ];
                this.saveData();
            }

            if (savedHistory) {
                this.calculationHistory = JSON.parse(savedHistory);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    saveData() {
        try {
            localStorage.setItem('attendance-students', JSON.stringify(this.students));
            localStorage.setItem('calculation-history', JSON.stringify(this.calculationHistory));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    // Event Listeners
    setupEventListeners() {
        try {
            console.log('Setting up event listeners...');
            
            // Navigation with better error handling
            const navButtons = document.querySelectorAll('.nav-btn');
            console.log('Found nav buttons:', navButtons.length);
            
            navButtons.forEach((btn, index) => {
                const viewName = btn.getAttribute('data-view');
                console.log(`Setting up nav button ${index}: ${viewName}`);
                
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Nav button clicked:', viewName);
                    this.switchView(viewName);
                });
            });

            // Student Management
            this.setupStudentListeners();
            
            // Modal controls
            this.setupModalListeners();
            
            // Search functionality
            const searchInput = document.getElementById('student-search');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.filterStudents(e.target.value);
                });
            }

            // Attendance controls
            this.setupAttendanceListeners();

            // Export functionality
            const exportBtn = document.getElementById('export-csv');
            if (exportBtn) {
                exportBtn.addEventListener('click', () => {
                    this.exportToCSV();
                });
            }

            // Table sorting
            this.setupTableSorting();

            // Confirmation modal
            this.setupConfirmationListeners();

            // Calculator Event Listeners
            this.setupCalculatorListeners();

            console.log('Event listeners setup complete');
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    setupStudentListeners() {
        const addStudentBtn = document.getElementById('add-student-btn');
        if (addStudentBtn) {
            addStudentBtn.addEventListener('click', () => {
                this.openStudentModal();
            });
        }

        const studentForm = document.getElementById('student-form');
        if (studentForm) {
            studentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveStudent();
            });
        }
    }

    setupTableSorting() {
        const sortableHeaders = document.querySelectorAll('.sortable');
        sortableHeaders.forEach(th => {
            th.addEventListener('click', (e) => {
                const sortBy = e.target.getAttribute('data-sort');
                if (sortBy) {
                    this.sortTable(sortBy);
                }
            });
        });
    }

    setupModalListeners() {
        const modalClose = document.getElementById('modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.closeModal();
            });
        }

        const cancelBtn = document.getElementById('cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', () => {
                this.closeModal();
            });
        }
    }

    setupAttendanceListeners() {
        const attendanceDate = document.getElementById('attendance-date');
        if (attendanceDate) {
            attendanceDate.addEventListener('change', () => {
                this.renderAttendanceView();
            });
            // Set today's date as default
            attendanceDate.valueAsDate = new Date();
        }

        const bulkPresentBtn = document.getElementById('bulk-present');
        if (bulkPresentBtn) {
            bulkPresentBtn.addEventListener('click', () => {
                this.markAllPresent();
            });
        }
    }

    setupConfirmationListeners() {
        const confirmCancel = document.getElementById('confirm-cancel');
        if (confirmCancel) {
            confirmCancel.addEventListener('click', () => {
                this.closeConfirmModal();
            });
        }

        const confirmOk = document.getElementById('confirm-ok');
        if (confirmOk) {
            confirmOk.addEventListener('click', () => {
                if (this.confirmCallback) {
                    this.confirmCallback();
                    this.closeConfirmModal();
                }
            });
        }
    }

    setupCalculatorListeners() {
        // Dashboard widget calculator
        const widgetAttended = document.getElementById('widget-attended');
        const widgetTotal = document.getElementById('widget-total');
        const widgetClear = document.getElementById('widget-clear');

        if (widgetAttended && widgetTotal) {
            console.log('Setting up widget calculator listeners');
            [widgetAttended, widgetTotal].forEach(input => {
                input.addEventListener('input', () => {
                    console.log('Widget calculator input changed');
                    this.updateWidgetCalculation();
                });
                input.addEventListener('keyup', () => {
                    this.updateWidgetCalculation();
                });
                input.addEventListener('change', () => {
                    this.updateWidgetCalculation();
                });
            });
        }

        if (widgetClear) {
            widgetClear.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Widget clear button clicked');
                this.clearWidgetCalculation();
            });
        }

        // Main calculator
        const calcCalculate = document.getElementById('calc-calculate');
        const calcClear = document.getElementById('calc-clear');
        const calcAttended = document.getElementById('calc-attended');
        const calcTotal = document.getElementById('calc-total');

        if (calcCalculate) {
            calcCalculate.addEventListener('click', () => {
                this.calculateAttendanceManual();
            });
        }

        if (calcClear) {
            calcClear.addEventListener('click', () => {
                this.clearManualCalculation();
            });
        }

        if (calcAttended && calcTotal) {
            [calcAttended, calcTotal].forEach(input => {
                input.addEventListener('input', () => {
                    this.clearCalculationErrors();
                });
            });
        }

        // Clear history button
        const clearHistory = document.getElementById('clear-history');
        if (clearHistory) {
            clearHistory.addEventListener('click', () => {
                this.clearCalculationHistory();
            });
        }

        // Reports inline calculator
        const reportAttended = document.getElementById('report-attended');
        const reportTotal = document.getElementById('report-total');

        if (reportAttended && reportTotal) {
            [reportAttended, reportTotal].forEach(input => {
                input.addEventListener('input', () => {
                    this.updateReportsCalculation();
                });
            });
        }
    }

    // Manual Calculator Functions
    updateWidgetCalculation() {
        try {
            const attendedEl = document.getElementById('widget-attended');
            const totalEl = document.getElementById('widget-total');
            const resultEl = document.getElementById('widget-result');

            if (!attendedEl || !totalEl || !resultEl) {
                console.log('Widget calculator elements not found');
                return;
            }

            console.log('Updating widget calculation...', {
                attended: attendedEl.value,
                total: totalEl.value
            });

            const attendedValue = attendedEl.value.trim();
            const totalValue = totalEl.value.trim();

            // Clear display if either field is empty
            if (attendedValue === '' || totalValue === '') {
                resultEl.innerHTML = `
                    <div class="result-percentage">--%</div>
                    <div class="result-status">Enter values to calculate</div>
                `;
                return;
            }

            const attended = parseFloat(attendedValue);
            const total = parseFloat(totalValue);

            // Validate inputs
            if (isNaN(attended) || isNaN(total) || total <= 0 || attended < 0 || attended > total) {
                resultEl.innerHTML = `
                    <div class="result-percentage">--%</div>
                    <div class="result-status">Invalid input</div>
                `;
                return;
            }

            const percentage = (attended / total * 100);
            const status = this.getAttendanceStatus(percentage);
            const statusClass = this.getStatusClass(percentage);

            console.log('Widget calculation result:', { attended, total, percentage, status });

            resultEl.innerHTML = `
                <div class="result-percentage ${statusClass}">${percentage.toFixed(1)}%</div>
                <div class="result-status">${status}</div>
            `;
        } catch (error) {
            console.error('Error updating widget calculation:', error);
        }
    }

    clearWidgetCalculation() {
        try {
            console.log('Clearing widget calculation');
            const attendedEl = document.getElementById('widget-attended');
            const totalEl = document.getElementById('widget-total');
            const resultEl = document.getElementById('widget-result');

            if (attendedEl) {
                attendedEl.value = '';
                console.log('Cleared attended field');
            }
            if (totalEl) {
                totalEl.value = '';
                console.log('Cleared total field');
            }
            
            if (resultEl) {
                resultEl.innerHTML = `
                    <div class="result-percentage">--%</div>
                    <div class="result-status">Enter values to calculate</div>
                `;
                console.log('Reset result display');
            }
        } catch (error) {
            console.error('Error clearing widget calculation:', error);
        }
    }

    calculateAttendanceManual() {
        try {
            const attendedEl = document.getElementById('calc-attended');
            const totalEl = document.getElementById('calc-total');
            const resultEl = document.getElementById('calc-result');

            if (!attendedEl || !totalEl || !resultEl) return;

            const attended = parseFloat(attendedEl.value);
            const total = parseFloat(totalEl.value);

            // Clear previous errors
            this.clearCalculationErrors();

            // Validation
            let hasError = false;

            if (attendedEl.value === '') {
                this.showInputError('attended-error', 'Please enter classes attended');
                hasError = true;
            } else if (isNaN(attended) || attended < 0) {
                this.showInputError('attended-error', 'Please enter a valid positive number');
                hasError = true;
            }

            if (totalEl.value === '') {
                this.showInputError('total-error', 'Please enter total classes');
                hasError = true;
            } else if (isNaN(total) || total <= 0) {
                this.showInputError('total-error', 'Total classes must be greater than 0');
                hasError = true;
            }

            if (!hasError && attended > total) {
                this.showInputError('attended-error', 'Classes attended cannot exceed total classes');
                hasError = true;
            }

            if (hasError) {
                resultEl.className = 'result-display';
                resultEl.innerHTML = `
                    <div class="result-percentage">--%</div>
                    <div class="result-status">Please fix errors above</div>
                    <div class="result-details"></div>
                `;
                return;
            }

            // Calculate percentage
            const percentage = (attended / total * 100);
            const status = this.getAttendanceStatus(percentage);
            const statusKey = this.getStatusKey(percentage);

            // Update result display
            resultEl.className = `result-display result-${statusKey}`;
            resultEl.innerHTML = `
                <div class="result-percentage">${percentage.toFixed(1)}%</div>
                <div class="result-status">${status}</div>
                <div class="result-details">${attended} out of ${total} classes attended</div>
            `;

            // Add to history
            this.addToCalculationHistory(attended, total, percentage);
            this.renderCalculationHistory();

            this.showToast('Percentage calculated successfully');
        } catch (error) {
            console.error('Error calculating attendance manually:', error);
        }
    }

    clearManualCalculation() {
        try {
            const attendedEl = document.getElementById('calc-attended');
            const totalEl = document.getElementById('calc-total');
            const resultEl = document.getElementById('calc-result');

            if (attendedEl) attendedEl.value = '';
            if (totalEl) totalEl.value = '';
            
            if (resultEl) {
                resultEl.className = 'result-display';
                resultEl.innerHTML = `
                    <div class="result-percentage">--%</div>
                    <div class="result-status">Enter values and click Calculate</div>
                    <div class="result-details"></div>
                `;
            }

            this.clearCalculationErrors();
        } catch (error) {
            console.error('Error clearing manual calculation:', error);
        }
    }

    clearCalculationErrors() {
        const attendedError = document.getElementById('attended-error');
        const totalError = document.getElementById('total-error');

        if (attendedError) attendedError.textContent = '';
        if (totalError) totalError.textContent = '';
    }

    showInputError(elementId, message) {
        const errorEl = document.getElementById(elementId);
        if (errorEl) {
            errorEl.textContent = message;
        }
    }

    updateReportsCalculation() {
        try {
            const attendedEl = document.getElementById('report-attended');
            const totalEl = document.getElementById('report-total');
            const resultEl = document.getElementById('report-calc-result');

            if (!attendedEl || !totalEl || !resultEl) return;

            const attended = parseFloat(attendedEl.value);
            const total = parseFloat(totalEl.value);

            if (attendedEl.value === '' || totalEl.value === '' || isNaN(attended) || isNaN(total) || total <= 0 || attended < 0 || attended > total) {
                resultEl.textContent = '--%';
                return;
            }

            const percentage = (attended / total * 100);
            resultEl.textContent = `${percentage.toFixed(1)}%`;
        } catch (error) {
            console.error('Error updating reports calculation:', error);
        }
    }

    addToCalculationHistory(attended, total, percentage) {
        try {
            const historyItem = {
                attended,
                total,
                percentage,
                timestamp: new Date().toISOString()
            };

            this.calculationHistory.unshift(historyItem);
            
            // Keep only last 10 calculations
            if (this.calculationHistory.length > 10) {
                this.calculationHistory = this.calculationHistory.slice(0, 10);
            }

            this.saveData();
        } catch (error) {
            console.error('Error adding to calculation history:', error);
        }
    }

    renderCalculationHistory() {
        try {
            const historyEl = document.getElementById('calc-history');
            if (!historyEl) return;

            if (this.calculationHistory.length === 0) {
                historyEl.innerHTML = '<p class="text-secondary">No recent calculations</p>';
                return;
            }

            historyEl.innerHTML = this.calculationHistory.map(item => {
                const statusClass = this.getStatusKey(item.percentage);
                return `
                    <div class="history-item">
                        <div class="history-calculation">${item.attended}/${item.total}</div>
                        <div class="history-result result-${statusClass}">${item.percentage.toFixed(1)}%</div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error rendering calculation history:', error);
        }
    }

    clearCalculationHistory() {
        this.showConfirmDialog(
            'Clear History',
            'Are you sure you want to clear all calculation history?',
            () => {
                this.calculationHistory = [];
                this.saveData();
                this.renderCalculationHistory();
                this.showToast('Calculation history cleared');
            }
        );
    }

    // Helper functions for attendance calculation
    getAttendanceStatus(percentage) {
        if (percentage >= 90) return 'Excellent';
        if (percentage >= 75) return 'Good';
        if (percentage >= 60) return 'Poor';
        return 'Critical';
    }

    getStatusClass(percentage) {
        if (percentage >= 90) return 'excellent';
        if (percentage >= 75) return 'good';
        if (percentage >= 60) return 'poor';
        return 'critical';
    }

    getStatusKey(percentage) {
        if (percentage >= 90) return 'excellent';
        if (percentage >= 75) return 'good';
        if (percentage >= 60) return 'poor';
        return 'critical';
    }

    // View Management - Enhanced with better error handling
    switchView(viewName) {
        try {
            console.log('Switching to view:', viewName);
            
            // Update navigation buttons
            const navButtons = document.querySelectorAll('.nav-btn');
            navButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            const activeNavBtn = document.querySelector(`[data-view="${viewName}"]`);
            if (activeNavBtn) {
                activeNavBtn.classList.add('active');
                console.log('Activated nav button for:', viewName);
            } else {
                console.error('Nav button not found for view:', viewName);
            }

            // Hide all views first
            const allViews = document.querySelectorAll('.view');
            console.log('Found views:', allViews.length);
            
            allViews.forEach(view => {
                view.classList.remove('active');
                view.style.display = 'none'; // Force hide
            });
            
            // Show target view
            const targetView = document.getElementById(`${viewName}-view`);
            if (targetView) {
                targetView.classList.add('active');
                targetView.style.display = 'block'; // Force show
                console.log('Activated view:', targetView.id);
            } else {
                console.error('Target view element not found:', `${viewName}-view`);
                return;
            }

            this.currentView = viewName;
            
            // Render the view content
            setTimeout(() => {
                this.renderCurrentView();
            }, 50);
            
        } catch (error) {
            console.error('Error switching views:', error);
        }
    }

    renderCurrentView() {
        try {
            console.log('Rendering current view:', this.currentView);
            switch (this.currentView) {
                case 'dashboard':
                    this.updateDashboard();
                    break;
                case 'calculator':
                    this.renderCalculatorView();
                    break;
                case 'students':
                    this.renderStudentsView();
                    break;
                case 'attendance':
                    this.renderAttendanceView();
                    break;
                case 'reports':
                    this.renderReportsView();
                    break;
                default:
                    console.error('Unknown view:', this.currentView);
            }
        } catch (error) {
            console.error('Error rendering current view:', error);
        }
    }

    // Dashboard
    updateDashboard() {
        try {
            console.log('Updating dashboard...');
            const totalStudents = this.students.length;
            const avgAttendance = this.calculateAverageAttendance();
            const lowAttendanceCount = this.students.filter(s => this.calculateAttendancePercentage(s) < 75).length;
            const totalRecords = this.students.reduce((total, s) => total + s.attendanceRecords.length, 0);

            const elements = {
                'total-students': totalStudents,
                'avg-attendance': `${avgAttendance.toFixed(1)}%`,
                'low-attendance-count': lowAttendanceCount,
                'total-records': totalRecords
            };

            Object.keys(elements).forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = elements[id];
                }
            });

            this.renderRecentActivity();
            this.clearWidgetCalculation(); // Reset widget calculator
            console.log('Dashboard updated successfully');
        } catch (error) {
            console.error('Error updating dashboard:', error);
        }
    }

    renderRecentActivity() {
        try {
            const recentContainer = document.getElementById('recent-attendance');
            if (!recentContainer) return;

            const recent = this.getRecentAttendance(5);

            if (recent.length === 0) {
                recentContainer.innerHTML = '<p class="text-secondary">No recent attendance records</p>';
                return;
            }

            recentContainer.innerHTML = recent.map(record => `
                <div class="activity-item">
                    <div class="activity-info">
                        <div class="activity-name">${record.studentName}</div>
                        <div class="activity-details">${record.studentId} • ${record.class} • ${this.formatDate(record.date)}</div>
                    </div>
                    <div class="activity-status ${record.status}">${record.status.charAt(0).toUpperCase() + record.status.slice(1)}</div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error rendering recent activity:', error);
        }
    }

    getRecentAttendance(limit = 5) {
        const allRecords = [];
        this.students.forEach(student => {
            student.attendanceRecords.forEach(record => {
                allRecords.push({
                    ...record,
                    studentName: student.name,
                    studentId: student.studentId,
                    class: student.class
                });
            });
        });

        return allRecords
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }

    // Calculator View
    renderCalculatorView() {
        try {
            console.log('Rendering calculator view...');
            this.renderCalculationHistory();
            this.clearManualCalculation();
        } catch (error) {
            console.error('Error rendering calculator view:', error);
        }
    }

    // Students Management
    renderStudentsView() {
        try {
            console.log('Rendering students view...');
            const container = document.getElementById('students-list');
            if (!container) return;

            const searchInput = document.getElementById('student-search');
            const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
            
            let filteredStudents = this.students;
            if (searchTerm) {
                filteredStudents = this.students.filter(student =>
                    student.name.toLowerCase().includes(searchTerm) ||
                    student.studentId.toLowerCase().includes(searchTerm) ||
                    student.class.toLowerCase().includes(searchTerm)
                );
            }

            if (filteredStudents.length === 0) {
                container.innerHTML = '<p class="text-secondary">No students found</p>';
                return;
            }

            container.innerHTML = filteredStudents.map(student => {
                const percentage = this.calculateAttendancePercentage(student);
                const stats = this.getAttendanceStats(student);
                const attendanceClass = percentage >= 90 ? 'excellent' : percentage >= 75 ? 'good' : 'poor';

                return `
                    <div class="student-card">
                        <div class="student-header">
                            <h4 class="student-name">${student.name}</h4>
                            <div class="student-actions">
                                <button class="btn-icon-only" onclick="window.app.editStudent('${student.id}')" title="Edit Student">
                                    ✏️
                                </button>
                                <button class="btn-icon-only" onclick="window.app.deleteStudent('${student.id}')" title="Delete Student">
                                    🗑️
                                </button>
                            </div>
                        </div>
                        <div class="student-details">
                            <div class="student-detail">
                                <span class="detail-label">Student ID:</span>
                                <span class="detail-value">${student.studentId}</span>
                            </div>
                            <div class="student-detail">
                                <span class="detail-label">Class:</span>
                                <span class="detail-value">${student.class}</span>
                            </div>
                        </div>
                        <div class="attendance-summary">
                            <div class="attendance-percentage ${attendanceClass}">${percentage.toFixed(1)}%</div>
                            <div class="attendance-breakdown">
                                ${stats.total} days • ${stats.present} present • ${stats.absent} absent • ${stats.late} late
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error rendering students view:', error);
        }
    }

    filterStudents(searchTerm) {
        this.renderStudentsView();
    }

    openStudentModal(studentId = null) {
        try {
            this.currentEditingStudent = studentId;
            const modal = document.getElementById('student-modal');
            const title = document.getElementById('modal-title');
            const form = document.getElementById('student-form');

            if (!modal || !title || !form) return;

            if (studentId) {
                const student = this.students.find(s => s.id === studentId);
                if (student) {
                    title.textContent = 'Edit Student';
                    document.getElementById('student-name').value = student.name;
                    document.getElementById('student-id-input').value = student.studentId;
                    document.getElementById('student-class').value = student.class;
                }
            } else {
                title.textContent = 'Add Student';
                form.reset();
            }

            modal.classList.remove('hidden');
            const nameInput = document.getElementById('student-name');
            if (nameInput) nameInput.focus();
        } catch (error) {
            console.error('Error opening student modal:', error);
        }
    }

    closeModal() {
        try {
            const modal = document.getElementById('student-modal');
            if (modal) {
                modal.classList.add('hidden');
            }
            this.currentEditingStudent = null;
        } catch (error) {
            console.error('Error closing modal:', error);
        }
    }

    saveStudent() {
        try {
            const nameEl = document.getElementById('student-name');
            const studentIdEl = document.getElementById('student-id-input');
            const classEl = document.getElementById('student-class');

            if (!nameEl || !studentIdEl || !classEl) {
                this.showToast('Form elements not found', 'error');
                return;
            }

            const name = nameEl.value.trim();
            const studentId = studentIdEl.value.trim();
            const studentClass = classEl.value.trim();

            if (!name || !studentId || !studentClass) {
                this.showToast('Please fill in all fields', 'error');
                return;
            }

            // Check for duplicate student ID (except when editing the same student)
            const existingStudent = this.students.find(s => 
                s.studentId === studentId && s.id !== this.currentEditingStudent
            );

            if (existingStudent) {
                this.showToast('Student ID already exists', 'error');
                return;
            }

            if (this.currentEditingStudent) {
                // Edit existing student
                const student = this.students.find(s => s.id === this.currentEditingStudent);
                if (student) {
                    student.name = name;
                    student.studentId = studentId;
                    student.class = studentClass;
                    this.showToast('Student updated successfully');
                }
            } else {
                // Add new student
                const newStudent = {
                    id: Date.now().toString(),
                    name,
                    studentId,
                    class: studentClass,
                    attendanceRecords: []
                };
                this.students.push(newStudent);
                this.showToast('Student added successfully');
            }

            this.saveData();
            this.closeModal();
            this.renderCurrentView();
            this.updateDashboard();
        } catch (error) {
            console.error('Error saving student:', error);
            this.showToast('Error saving student', 'error');
        }
    }

    editStudent(studentId) {
        this.openStudentModal(studentId);
    }

    deleteStudent(studentId) {
        try {
            const student = this.students.find(s => s.id === studentId);
            if (!student) return;

            this.showConfirmDialog(
                'Delete Student',
                `Are you sure you want to delete ${student.name}? This action cannot be undone.`,
                () => {
                    this.students = this.students.filter(s => s.id !== studentId);
                    this.saveData();
                    this.renderCurrentView();
                    this.updateDashboard();
                    this.showToast('Student deleted successfully');
                }
            );
        } catch (error) {
            console.error('Error deleting student:', error);
        }
    }

    // Attendance Management
    renderAttendanceView() {
        try {
            console.log('Rendering attendance view...');
            const dateInput = document.getElementById('attendance-date');
            const container = document.getElementById('attendance-list');
            
            if (!dateInput || !container) return;

            const selectedDate = dateInput.value;

            if (!selectedDate) {
                container.innerHTML = '<p class="text-secondary">Please select a date</p>';
                return;
            }

            if (this.students.length === 0) {
                container.innerHTML = '<p class="text-secondary">No students to mark attendance for</p>';
                return;
            }

            container.innerHTML = this.students.map(student => {
                const existingRecord = student.attendanceRecords.find(r => r.date === selectedDate);
                const currentStatus = existingRecord ? existingRecord.status : '';

                return `
                    <div class="attendance-row">
                        <div class="student-info">
                            <h4>${student.name}</h4>
                            <div class="student-meta">${student.studentId} • ${student.class}</div>
                        </div>
                        <div class="attendance-buttons">
                            <button class="attendance-btn present ${currentStatus === 'present' ? 'active' : ''}"
                                    onclick="window.app.markAttendance('${student.id}', '${selectedDate}', 'present')">
                                Present
                            </button>
                            <button class="attendance-btn absent ${currentStatus === 'absent' ? 'active' : ''}"
                                    onclick="window.app.markAttendance('${student.id}', '${selectedDate}', 'absent')">
                                Absent
                            </button>
                            <button class="attendance-btn late ${currentStatus === 'late' ? 'active' : ''}"
                                    onclick="window.app.markAttendance('${student.id}', '${selectedDate}', 'late')">
                                Late
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error rendering attendance view:', error);
        }
    }

    markAttendance(studentId, date, status) {
        try {
            const student = this.students.find(s => s.id === studentId);
            if (!student) return;

            const existingRecordIndex = student.attendanceRecords.findIndex(r => r.date === date);

            if (existingRecordIndex !== -1) {
                student.attendanceRecords[existingRecordIndex].status = status;
            } else {
                student.attendanceRecords.push({ date, status });
            }

            this.saveData();
            this.renderAttendanceView();
            this.updateDashboard();
            this.showToast(`Attendance marked as ${status}`);
        } catch (error) {
            console.error('Error marking attendance:', error);
        }
    }

    markAllPresent() {
        try {
            const dateInput = document.getElementById('attendance-date');
            if (!dateInput) return;

            const selectedDate = dateInput.value;
            if (!selectedDate) {
                this.showToast('Please select a date first', 'error');
                return;
            }

            this.students.forEach(student => {
                const existingRecordIndex = student.attendanceRecords.findIndex(r => r.date === selectedDate);
                if (existingRecordIndex !== -1) {
                    student.attendanceRecords[existingRecordIndex].status = 'present';
                } else {
                    student.attendanceRecords.push({ date: selectedDate, status: 'present' });
                }
            });

            this.saveData();
            this.renderAttendanceView();
            this.updateDashboard();
            this.showToast('All students marked as present');
        } catch (error) {
            console.error('Error marking all present:', error);
        }
    }

    // Reports
    renderReportsView() {
        try {
            console.log('Rendering reports view...');
            const tbody = document.getElementById('reports-table-body');
            if (!tbody) return;

            let studentsData = [...this.students];

            // Apply sorting if any
            if (this.sortOrder.column) {
                studentsData.sort((a, b) => {
                    let valueA, valueB;
                    
                    switch (this.sortOrder.column) {
                        case 'name':
                            valueA = a.name.toLowerCase();
                            valueB = b.name.toLowerCase();
                            break;
                        case 'studentId':
                            valueA = a.studentId.toLowerCase();
                            valueB = b.studentId.toLowerCase();
                            break;
                        case 'class':
                            valueA = a.class.toLowerCase();
                            valueB = b.class.toLowerCase();
                            break;
                        case 'total':
                            valueA = a.attendanceRecords.length;
                            valueB = b.attendanceRecords.length;
                            break;
                        case 'present':
                            valueA = this.getAttendanceStats(a).present;
                            valueB = this.getAttendanceStats(b).present;
                            break;
                        case 'absent':
                            valueA = this.getAttendanceStats(a).absent;
                            valueB = this.getAttendanceStats(b).absent;
                            break;
                        case 'late':
                            valueA = this.getAttendanceStats(a).late;
                            valueB = this.getAttendanceStats(b).late;
                            break;
                        case 'percentage':
                            valueA = this.calculateAttendancePercentage(a);
                            valueB = this.calculateAttendancePercentage(b);
                            break;
                        default:
                            return 0;
                    }

                    if (valueA < valueB) return this.sortOrder.ascending ? -1 : 1;
                    if (valueA > valueB) return this.sortOrder.ascending ? 1 : -1;
                    return 0;
                });
            }

            tbody.innerHTML = studentsData.map(student => {
                const stats = this.getAttendanceStats(student);
                const percentage = this.calculateAttendancePercentage(student);
                const rowClass = percentage < 75 ? 'low-attendance' : '';

                return `
                    <tr class="${rowClass}">
                        <td>${student.name}</td>
                        <td>${student.studentId}</td>
                        <td>${student.class}</td>
                        <td>${stats.total}</td>
                        <td>${stats.present}</td>
                        <td>${stats.absent}</td>
                        <td>${stats.late}</td>
                        <td>${percentage.toFixed(1)}%</td>
                    </tr>
                `;
            }).join('');
        } catch (error) {
            console.error('Error rendering reports view:', error);
        }
    }

    sortTable(column) {
        if (this.sortOrder.column === column) {
            this.sortOrder.ascending = !this.sortOrder.ascending;
        } else {
            this.sortOrder.column = column;
            this.sortOrder.ascending = true;
        }

        this.renderReportsView();
    }

    // Utility Functions
    calculateAttendancePercentage(student) {
        if (student.attendanceRecords.length === 0) return 0;
        
        const presentCount = student.attendanceRecords.filter(r => r.status === 'present').length;
        const lateCount = student.attendanceRecords.filter(r => r.status === 'late').length;
        
        // Consider late as partial attendance (0.5)
        const effectivePresent = presentCount + (lateCount * 0.5);
        return (effectivePresent / student.attendanceRecords.length) * 100;
    }

    getAttendanceStats(student) {
        const records = student.attendanceRecords;
        return {
            total: records.length,
            present: records.filter(r => r.status === 'present').length,
            absent: records.filter(r => r.status === 'absent').length,
            late: records.filter(r => r.status === 'late').length
        };
    }

    calculateAverageAttendance() {
        if (this.students.length === 0) return 0;
        
        const totalPercentage = this.students.reduce((sum, student) => {
            return sum + this.calculateAttendancePercentage(student);
        }, 0);
        
        return totalPercentage / this.students.length;
    }

    // Export Functionality
    exportToCSV() {
        try {
            if (this.students.length === 0) {
                this.showToast('No data to export', 'error');
                return;
            }

            const csvContent = this.generateCSV();
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                this.showToast('Report exported successfully');
            }
        } catch (error) {
            console.error('Error exporting CSV:', error);
            this.showToast('Error exporting report', 'error');
        }
    }

    generateCSV() {
        const headers = ['Student Name', 'Student ID', 'Class', 'Total Days', 'Present', 'Absent', 'Late', 'Attendance Percentage'];
        const rows = this.students.map(student => {
            const stats = this.getAttendanceStats(student);
            const percentage = this.calculateAttendancePercentage(student);
            
            return [
                student.name,
                student.studentId,
                student.class,
                stats.total,
                stats.present,
                stats.absent,
                stats.late,
                `${percentage.toFixed(1)}%`
            ];
        });

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        return csvContent;
    }

    // UI Helpers
    showToast(message, type = 'success') {
        try {
            const toast = document.getElementById('toast');
            const messageEl = document.getElementById('toast-message');
            
            if (!toast || !messageEl) return;

            messageEl.textContent = message;
            toast.className = `toast ${type}`;
            
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        } catch (error) {
            console.error('Error showing toast:', error);
        }
    }

    showConfirmDialog(title, message, callback) {
        try {
            const titleEl = document.getElementById('confirm-title');
            const messageEl = document.getElementById('confirm-message');
            const modal = document.getElementById('confirm-modal');

            if (titleEl) titleEl.textContent = title;
            if (messageEl) messageEl.textContent = message;
            if (modal) modal.classList.remove('hidden');
            
            this.confirmCallback = callback;
        } catch (error) {
            console.error('Error showing confirm dialog:', error);
        }
    }

    closeConfirmModal() {
        try {
            const modal = document.getElementById('confirm-modal');
            if (modal) {
                modal.classList.add('hidden');
            }
            this.confirmCallback = null;
        } catch (error) {
            console.error('Error closing confirm modal:', error);
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// Initialize the application and make it globally accessible
window.app = new AttendanceCalculator();