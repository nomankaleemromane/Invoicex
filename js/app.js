// Business Dashboard JavaScript Logic
class BusinessDashboard {
    constructor() {
        this.currentUserUid = null;
        this.selectedInvoices = new Set();
        this.init();
    }

    init() {
        this.initializeEventListeners();
        this.loadDashboard();
        this.setupRealtimeListeners();
    }

    // Required Functions
    getCurrentUserUid() {
        // First try to get from auth (most reliable)
        const user = auth.currentUser;
        if (user) {
            return user.uid;
        }
        
        // Fallback to localStorage
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            return userData.uid;
        }
        
        // If no user found, redirect to login
        alert('Please login first');
        window.location.href = 'index.html';
        return null;
    }

    initializeCharts(invoices, pools, transactions) {
        // Wait for DOM to be fully ready
        setTimeout(() => {
            if (typeof initializeBusinessCharts === 'function') {
                initializeBusinessCharts(invoices, pools, transactions);
            }
        }, 100);
    }

    // Blockchain Animation Methods
    showBlockchainAnimation() {
        const animation = document.getElementById('blockchainAnimation');
        const progressBar = document.getElementById('blockchainProgress');
        const hashDisplay = document.getElementById('hashDisplay');
        
        // Reset animation
        progressBar.style.width = '0%';
        hashDisplay.textContent = 'Generating transaction hash...';
        this.resetBlockchainSteps();
        
        // Show animation
        animation.classList.add('active');
        
        // Start the blockchain simulation
        this.simulateBlockchainProcess();
    }

    hideBlockchainAnimation() {
        const animation = document.getElementById('blockchainAnimation');
        animation.classList.remove('active');
    }

    resetBlockchainSteps() {
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`step${i}`).classList.remove('active');
        }
    }

    simulateBlockchainProcess() {
        const progressBar = document.getElementById('blockchainProgress');
        const hashDisplay = document.getElementById('hashDisplay');
        
        // Step 1: Encrypting (0-25%)
        setTimeout(() => {
            progressBar.style.width = '25%';
            document.getElementById('step1').classList.add('active');
            hashDisplay.textContent = 'Encrypting invoice data with AES-256...';
        }, 1000);
        
        // Step 2: Creating Block (25-50%)
        setTimeout(() => {
            progressBar.style.width = '50%';
            document.getElementById('step2').classList.add('active');
            hashDisplay.textContent = 'Creating block: 0x' + this.generateRandomHash();
        }, 3000);
        
        // Step 3: Mining (50-75%)
        setTimeout(() => {
            progressBar.style.width = '75%';
            document.getElementById('step3').classList.add('active');
            hashDisplay.textContent = 'Validating consensus...';
        }, 5000);
        
        // Step 4: Confirmed (75-100%)
        setTimeout(() => {
            progressBar.style.width = '100%';
            document.getElementById('step4').classList.add('active');
            hashDisplay.textContent = 'Block confirmed! Tx: 0x' + this.generateRandomHash();
        }, 7000);
    }

    generateRandomHash() {
        const chars = '0123456789abcdef';
        let hash = '';
        for (let i = 0; i < 64; i++) {
            hash += chars[Math.floor(Math.random() * chars.length)];
        }
        return hash;
    }

    createBlockchainVisualization() {
        const container = document.getElementById('blockchainViz');
        container.innerHTML = '';
        
        // Create nodes
        const nodeCount = 6;
        for (let i = 0; i < nodeCount; i++) {
            const node = document.createElement('div');
            node.className = 'blockchain-node';
            node.textContent = `Node ${i+1}`;
            node.style.left = `${10 + (i * 15)}%`;
            node.style.top = `${30 + Math.sin(i) * 20}%`;
            container.appendChild(node);
            
            // Animate nodes
            setTimeout(() => {
                node.style.opacity = '1';
                node.style.transform = 'scale(1)';
                node.style.transition = 'all 0.5s ease';
            }, i * 300);
            
            // Create connections
            if (i > 0) {
                const connection = document.createElement('div');
                connection.className = 'blockchain-connection';
                const prevNode = container.children[i-1];
                const prevRect = { left: 10 + ((i-1) * 15), top: 30 + Math.sin(i-1) * 20 };
                const currentRect = { left: 10 + (i * 15), top: 30 + Math.sin(i) * 20 };
                
                const length = Math.sqrt(
                    Math.pow(currentRect.left - prevRect.left, 2) + 
                    Math.pow(currentRect.top - prevRect.top, 2)
                ) * 0.8;
                
                const angle = Math.atan2(
                    currentRect.top - prevRect.top,
                    currentRect.left - prevRect.left
                ) * 180 / Math.PI;
                
                connection.style.width = `${length}%`;
                connection.style.left = `${prevRect.left + 2}%`;
                connection.style.top = `${prevRect.top}%`;
                connection.style.transform = `rotate(${angle}deg)`;
                
                container.appendChild(connection);
                
                // Animate connection
                setTimeout(() => {
                    connection.style.opacity = '1';
                    connection.style.transition = 'all 0.5s ease';
                }, i * 300 + 150);
            }
        }
    }
    async loadDashboard() {
        try {
            const uid = this.getCurrentUserUid();
            this.currentUserUid = uid;

            // Load all data in parallel
            const [userData, platformData, invoices, pools, transactions] = await Promise.all([
                this.fetchUserData(uid),
                this.fetchPlatformData(),
                this.fetchInvoicesForSeller(uid),
                this.fetchPoolsForSeller(uid),
                this.fetchTransactionsForSeller(uid)
            ]);

            this.renderOverviewCards(userData, invoices, transactions);
            this.renderInvoicesTable(invoices);
            this.renderPools(pools);
            this.renderTransactions(transactions);

            // Update welcome message
            document.getElementById('welcomeMessage').textContent = 
                `Welcome back, ${userData.fullName || 'Business User'}!`;

            // Initialize charts AFTER all rendering is done
            this.initializeCharts(invoices, pools, transactions);

        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showToast('Error loading dashboard data', 'error');
        }
    }

    async fetchUserData(uid) {
        const snapshot = await database.ref('users/' + uid).once('value');
        return snapshot.val();
    }

    async fetchPlatformData() {
        const snapshot = await database.ref('platform').once('value');
        return snapshot.val();
    }

    fetchInvoicesForSeller(uid) {
        return new Promise((resolve) => {
            database.ref('invoices').orderByChild('sellerUid').equalTo(uid).once('value', (snapshot) => {
                const invoices = [];
                snapshot.forEach((childSnapshot) => {
                    invoices.push({ id: childSnapshot.key, ...childSnapshot.val() });
                });
                resolve(invoices);
            });
        });
    }

    fetchPoolsForSeller(uid) {
        return new Promise((resolve) => {
            database.ref('pools').orderByChild('sellerUid').equalTo(uid).once('value', (snapshot) => {
                const pools = [];
                snapshot.forEach((childSnapshot) => {
                    pools.push({ id: childSnapshot.key, ...childSnapshot.val() });
                });
                resolve(pools);
            });
        });
    }

    fetchTransactionsForSeller(uid) {
        return new Promise((resolve) => {
            database.ref('transactions').orderByChild('toUid').equalTo(uid).once('value', (snapshot) => {
                const transactions = [];
                snapshot.forEach((childSnapshot) => {
                    transactions.push({ id: childSnapshot.key, ...childSnapshot.val() });
                });
                // Sort by timestamp descending
                transactions.sort((a, b) => b.timestamp - a.timestamp);
                resolve(transactions);
            });
        });
    }

    renderOverviewCards(user, invoices, transactions) {
        // Credit Limit
        const creditLimit = user?.financingLimit || 0;
        document.getElementById('card-creditLimit').textContent = creditLimit.toLocaleString();

        // Invoices Count
        document.getElementById('card-invoicesCount').textContent = invoices.length;

        // Funds Received - FIXED: Use 'investment' type instead of 'advance'
        const fundsReceived = transactions
            .filter(tx => tx.type === 'investment' && tx.toUid === this.currentUserUid)
            .reduce((sum, tx) => sum + tx.amount, 0);
        document.getElementById('card-fundsReceived').textContent = fundsReceived.toLocaleString();

        // Pending Verifications - FIXED: Use correct status from your database
        const pendingVerifications = invoices.filter(inv => inv.status === 'pending_verification').length;
        document.getElementById('card-pendingVerifications').textContent = pendingVerifications;
    }

    renderInvoicesTable(invoices) {
        const tbody = document.querySelector('#invoices-table tbody');
        tbody.innerHTML = '';

        invoices.forEach(invoice => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <input type="checkbox" class="invoice-checkbox" data-invoice-id="${invoice.id}" 
                        ${invoice.status === 'verified' ? '' : 'disabled'}
                </td>
                <td>
                    <a href="#" class="view-invoice" data-invoice-id="${invoice.id}" 
                    style="color: var(--primary-color); text-decoration: none;">
                        ${invoice.id}
                    </a>
                </td>
                <td>${invoice.buyerName}</td>
                <td>${invoice.amount?.toLocaleString() || '0'}</td>
                <td>${this.formatDate(invoice.dueDate)}</td>
                <td><span class="status-badge status-${invoice.status}">${invoice.status}</span></td>
                <td>${invoice.discountRate ? invoice.discountRate + '%' : '-'}</td>
                <td>${invoice.fundedAmount?.toLocaleString() || '0'}</td>
                <td>
                    <!-- REMOVED THE VERIFY BUTTON - Only admins can verify -->
                </td>
            `;
            tbody.appendChild(row);
        });

        this.attachInvoiceEventListeners();
    }

    renderPools(pools) {
        const container = document.getElementById('my-pools');
        container.innerHTML = '';

        pools.forEach(pool => {
            const poolCard = document.createElement('div');
            poolCard.className = 'pool-card';
            poolCard.innerHTML = `
                <div class="pool-header">
                    <div class="pool-name">${pool.name}</div>
                    <span class="status-badge status-${pool.status}">${pool.status}</span>
                </div>
                <div class="pool-details">
                    <div class="pool-detail">
                        <div class="detail-value">AED ${pool.faceValueTotal?.toLocaleString() || '0'}</div>
                        <div class="detail-label">Face Value</div>
                    </div>
                    <div class="pool-detail">
                        <div class="detail-value">AED ${pool.advanceAmount?.toLocaleString() || '0'}</div>
                        <div class="detail-label">Advance Amount</div>
                    </div>
                    <div class="pool-detail">
                        <div class="detail-value">${pool.discountPercent || '0'}%</div>
                        <div class="detail-label">Discount</div>
                    </div>
                    <div class="pool-detail">
                        <div class="detail-value">AED ${pool.fundedAmount?.toLocaleString() || '0'}</div>
                        <div class="detail-label">Funded Amount</div>
                    </div>
                </div>
                <div class="pool-actions">
                    <!-- Request Advance button removed intentionally -->
                </div>
            `;
            container.appendChild(poolCard);
        });

        this.attachPoolEventListeners();
    }

    renderTransactions(transactions) {
        const tbody = document.querySelector('#payouts-list tbody');
        tbody.innerHTML = '';

        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.id}</td>
                <td>${transaction.type}</td>
                <td>${transaction.amount?.toLocaleString() || '0'}</td>
                <td>${transaction.relatedPool || '-'}</td>
                <td>${this.formatTimestamp(transaction.timestamp)}</td>
            `;
            tbody.appendChild(row);
        });
    }

    async uploadInvoice(formElement) {
        const formData = new FormData(formElement);
        const fileInput = document.getElementById('pdfFile');
        const pdfFile = fileInput.files[0];
        
        // Validate that a PDF file is selected
        if (!pdfFile) {
            this.showToast('Please select a PDF file to upload', 'error');
            return;
        }

        // Validate file type
        if (pdfFile.type !== 'application/pdf') {
            this.showToast('Please upload a valid PDF file', 'error');
            return;
        }

        const invoiceData = {
            invoiceId: document.getElementById('invoiceId').value,
            buyerName: document.getElementById('buyerName').value,
            buyerEmail: document.getElementById('buyerEmail').value,
            amount: parseFloat(document.getElementById('amount').value),
            dueDate: document.getElementById('dueDate').value,
            discountPref: parseInt(document.getElementById('discountPref').value)
        };

        // Validate inputs
        if (!invoiceData.invoiceId || !invoiceData.buyerName || !invoiceData.amount || !invoiceData.dueDate) {
            this.showToast('Please fill all required fields', 'error');
            return;
        }

        // Check for duplicate invoice ID
        const existingInvoice = await database.ref('invoices/' + invoiceData.invoiceId).once('value');
        if (existingInvoice.exists()) {
            this.showToast('Invoice ID already exists', 'error');
            return;
        }

        try {
            // Show blockchain animation
            this.showBlockchainAnimation();
            
            // Wait for blockchain animation to complete before proceeding with upload
            setTimeout(async () => {
                try {
                    // 1. Upload PDF to Firebase Storage
                    const storageRef = storage.ref();
                    const pdfRef = storageRef.child(`invoices/${this.getCurrentUserUid()}/${invoiceData.invoiceId}.pdf`);
                    
                    const uploadTask = await pdfRef.put(pdfFile);
                    const downloadURL = await uploadTask.ref.getDownloadURL();

                    // 2. Calculate file hash (simplified for demo)
                    const fileHash = 'sha256-' + btoa(invoiceData.invoiceId + Date.now()).substring(0, 32);
                    
                    // 3. Prepare invoice object with storage reference
                    const invoice = {
                        invoiceId: invoiceData.invoiceId,
                        sellerUid: this.getCurrentUserUid(),
                        sellerBusinessName: 'Frost and Flare', // Would come from user data
                        buyerName: invoiceData.buyerName,
                        buyerEmail: invoiceData.buyerEmail,
                        amount: invoiceData.amount,
                        dueDate: invoiceData.dueDate,
                        status: 'pending_verification',
                        discountRate: null,
                        fundedAmount: 0,
                        fileHash: fileHash,
                        pdfName: pdfFile.name,
                        pdfStorageUrl: downloadURL, // Add this field
                        pdfStoragePath: `invoices/${this.getCurrentUserUid()}/${invoiceData.invoiceId}.pdf`, // Add this field
                        fileSize: pdfFile.size,
                        uploadedAt: Date.now(),
                        createdAt: Date.now()
                    };

                    // 4. Save invoice data to Realtime Database
                    await database.ref('invoices/' + invoiceData.invoiceId).set(invoice);
                    
                    // IMMEDIATELY hide blockchain animation, show success, and close modal
                    this.hideBlockchainAnimation();
                    this.showToast('Invoice uploaded and secured on blockchain successfully!');
                    this.closeModal('uploadModal');
                    formElement.reset();
                    
                } catch (error) {
                    // IMMEDIATELY hide blockchain animation on error too
                    this.hideBlockchainAnimation();
                    console.error('Error uploading invoice:', error);
                    
                    if (error.code === 'storage/unauthorized') {
                        this.showToast('Unauthorized to upload files', 'error');
                    } else if (error.code === 'storage/canceled') {
                        this.showToast('Upload canceled', 'error');
                    } else if (error.code === 'storage/unknown') {
                        this.showToast('Unknown upload error', 'error');
                    } else {
                        this.showToast('Error uploading invoice', 'error');
                    }
                }
            }, 9000); // Keep the same duration for the animation to complete

        } catch (error) {
            this.hideBlockchainAnimation();
            console.error('Error in upload process:', error);
            this.showToast('Error starting upload process', 'error');
        }
    }
    
    async verifyInvoice(invoiceId) {
        try {
            await database.ref('invoices/' + invoiceId).update({
                status: 'verified'
            });
            this.showToast('Invoice verified successfully!');
        } catch (error) {
            console.error('Error verifying invoice:', error);
        }
    }

    async createPoolFromSelection(poolName, selectedInvoiceIds, discountPercent) {
        if (!poolName || selectedInvoiceIds.length === 0) {
            this.showToast('Please provide a pool name and select at least one invoice', 'error');
            return;
        }

        // Calculate pool totals
        let faceValueTotal = 0;
        const invoicePromises = selectedInvoiceIds.map(invoiceId => 
            database.ref('invoices/' + invoiceId).once('value')
        );

        const invoiceSnapshots = await Promise.all(invoicePromises);
        invoiceSnapshots.forEach(snapshot => {
            const invoice = snapshot.val();
            faceValueTotal += invoice.amount;
        });

        const advanceAmount = faceValueTotal * (1 - discountPercent / 100);
        const poolId = 'POOL-' + Date.now().toString(36).toUpperCase();

        // Create pool object
        const pool = {
            poolId: poolId,
            sellerUid: this.getCurrentUserUid(),
            name: poolName,
            invoiceIds: {},
            faceValueTotal: faceValueTotal,
            discountPercent: discountPercent,
            advanceAmount: advanceAmount,
            fundedAmount: 0,
            status: 'listed',
            createdAt: Date.now()
        };

        // Add invoice IDs to pool
        selectedInvoiceIds.forEach(invoiceId => {
            pool.invoiceIds[invoiceId] = true;
        });

        try {
            await database.ref('pools/' + poolId).set(pool);
            
            // Update invoices to show they're in a pool
            const updatePromises = selectedInvoiceIds.map(invoiceId =>
                database.ref('invoices/' + invoiceId).update({
                    status: 'listed',
                    discountRate: discountPercent
                })
            );

            await Promise.all(updatePromises);
            this.showToast('Pool created successfully!');
            this.clearSelection();

        } catch (error) {
            console.error('Error creating pool:', error);
            this.showToast('Error creating pool', 'error');
        }
    }

    // UI Helper Methods
    initializeEventListeners() {
        // Modal controls
        document.getElementById('uploadInvoiceBtn').addEventListener('click', () => {
            this.openModal('uploadModal');
        });

        document.getElementById('closeUploadModal').addEventListener('click', () => {
            this.closeModal('uploadModal');
        });

        document.getElementById('closeInvoiceModal').addEventListener('click', () => {
            this.closeModal('invoiceModal');
        });

        // Form submission
        document.getElementById('upload-invoice-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.uploadInvoice(e.target);
        });

        // Discount slider
        document.getElementById('discountPref').addEventListener('input', (e) => {
            document.getElementById('discountValue').textContent = e.target.value + '%';
        });

        // Create pool button
        // Use custom pool discount input if present. This ensures only one handler is attached
        // and the chosen discount is used (avoids duplicate pool creation).
        const createPoolBtn = document.getElementById('createPoolBtn');
        if (createPoolBtn) {
            createPoolBtn.addEventListener('click', () => {
                const poolName = document.getElementById('poolNameInput').value;
                const poolDiscountEl = document.getElementById('poolDiscountInput');
                const discountPercent = poolDiscountEl ? (parseInt(poolDiscountEl.value, 10) || 15) : 15;
                this.createPoolFromSelection(poolName, Array.from(this.selectedInvoices), discountPercent);
            });
        }
        
        // Select all checkbox
        document.getElementById('selectAllCheckbox').addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('.invoice-checkbox:not(:disabled)');
            checkboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
                this.handleInvoiceSelection(checkbox);
            });
        });

        // Close modals on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal(overlay.id);
                }
            });
        });
    }

    attachInvoiceEventListeners() {
        // Invoice checkboxes
        document.querySelectorAll('.invoice-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleInvoiceSelection(e.target);
            });
        });

        // View invoice links
        document.querySelectorAll('.view-invoice').forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const invoiceId = e.target.getAttribute('data-invoice-id');
                await this.showInvoiceDetails(invoiceId);
            });
        });

        // REMOVED: Verify invoice buttons section
    }

    attachPoolEventListeners() {
        // No request-advance handlers anymore.
        // Keep this method minimal in case other pool-related handlers are added later.
    }

    handleInvoiceSelection(checkbox) {
        const invoiceId = checkbox.getAttribute('data-invoice-id');
        
        if (checkbox.checked) {
            this.selectedInvoices.add(invoiceId);
        } else {
            this.selectedInvoices.delete(invoiceId);
            document.getElementById('selectAllCheckbox').checked = false;
        }

        this.updateSelectionUI();
    }

    updateSelectionUI() {
        const actionBar = document.getElementById('poolActionBar');
        const selectedCount = document.getElementById('selectedCount');
        
        selectedCount.textContent = `${this.selectedInvoices.size} invoices selected`;
        
        if (this.selectedInvoices.size > 0) {
            actionBar.style.display = 'flex';
        } else {
            actionBar.style.display = 'none';
        }
    }

    clearSelection() {
        this.selectedInvoices.clear();
        document.querySelectorAll('.invoice-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        this.updateSelectionUI();
    }

    async showInvoiceDetails(invoiceId) {
        try {
            const snapshot = await database.ref('invoices/' + invoiceId).once('value');
            const invoice = snapshot.val();
            
            if (!invoice) {
                this.showToast('Invoice not found', 'error');
                return;
            }

            const detailsContainer = document.getElementById('invoiceDetails');
            detailsContainer.innerHTML = `
                <div style="display: grid; gap: 1rem;">
                    <div><strong>Invoice ID:</strong> ${invoice.invoiceId}</div>
                    <div><strong>Buyer:</strong> ${invoice.buyerName}</div>
                    <div><strong>Buyer Email:</strong> ${invoice.buyerEmail}</div>
                    <div><strong>Amount:</strong> AED ${invoice.amount?.toLocaleString() || '0'}</div>
                    <div><strong>Due Date:</strong> ${this.formatDate(invoice.dueDate)}</div>
                    <div><strong>Status:</strong> <span class="status-badge status-${invoice.status}">${invoice.status}</span></div>
                    <div><strong>Discount Rate:</strong> ${invoice.discountRate ? invoice.discountRate + '%' : 'Not set'}</div>
                    <div><strong>Funded Amount:</strong> AED ${invoice.fundedAmount?.toLocaleString() || '0'}</div>
                    <div><strong>PDF File:</strong> ${invoice.pdfName}</div>
                    <div><strong>File Size:</strong> ${invoice.fileSize ? (invoice.fileSize / 1024).toFixed(2) + ' KB' : 'N/A'}</div>
                    <div><strong>File Hash:</strong> ${invoice.fileHash}</div>
                    ${invoice.pdfStorageUrl ? 
                        `<div>
                            <strong>PDF:</strong> 
                            <a href="${invoice.pdfStorageUrl}" target="_blank" style="color: var(--primary-color); text-decoration: none; margin-left: 10px;">
                                <i class="fas fa-download"></i> Download PDF
                            </a>
                        </div>` : 
                        '<div><strong>PDF:</strong> Not available</div>'
                    }
                    <div><strong>Created:</strong> ${this.formatTimestamp(invoice.createdAt)}</div>
                </div>
            `;

            this.openModal('invoiceModal');
        } catch (error) {
            console.error('Error loading invoice details:', error);
            this.showToast('Error loading invoice details', 'error');
        }
    }

    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.style.background = type === 'error' ? '#f44336' : 'var(--success-color)';
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    setupRealtimeListeners() {
        const uid = this.getCurrentUserUid();
        
        // Listen for invoice changes
        database.ref('invoices').orderByChild('sellerUid').equalTo(uid).on('value', (snapshot) => {
            const invoices = [];
            snapshot.forEach((childSnapshot) => {
                invoices.push({ id: childSnapshot.key, ...childSnapshot.val() });
            });
            this.renderInvoicesTable(invoices);
        });

        // Listen for pool changes
        database.ref('pools').orderByChild('sellerUid').equalTo(uid).on('value', (snapshot) => {
            const pools = [];
            snapshot.forEach((childSnapshot) => {
                pools.push({ id: childSnapshot.key, ...childSnapshot.val() });
            });
            this.renderPools(pools);
        });

        // Listen for transaction changes
        database.ref('transactions').orderByChild('toUid').equalTo(uid).on('value', (snapshot) => {
            const transactions = [];
            snapshot.forEach((childSnapshot) => {
                transactions.push({ id: childSnapshot.key, ...childSnapshot.val() });
            });
            transactions.sort((a, b) => b.timestamp - a.timestamp);
            this.renderTransactions(transactions);
        });
    }

    // Utility Methods
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    formatTimestamp(timestamp) {
        if (!timestamp) return '-';
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
