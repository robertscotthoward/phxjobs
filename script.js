const { createApp } = Vue;

createApp({
    data() {
        return {
            title: 'Phoenix Staffing',
            loading: false,
            error: null,
            data: [],
            headers: [],
            searchQuery: '',
            sections: {
                employers: false,
                employees: false,
                consultants: false
            }
        };
    },
    computed: {
        filteredHeaders() {
            return this.headers.filter(header =>
                ['Type', 'Tags', 'Description'].includes(header)
            );
        }
    },
    watch: {
        searchQuery(newQuery) {
            // Auto-expand sections that have matching results
            if (newQuery) {
                this.sections.employers = this.getFilteredData('employer').length > 0;
                this.sections.employees = this.getFilteredData('employee').length > 0;
                this.sections.consultants = this.getFilteredData('consultant').length > 0;
            }
        }
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        toggleSection(section) {
            this.sections[section] = !this.sections[section];
        },
        matchesSearch(row) {
            if (!this.searchQuery) return true;

            const query = this.searchQuery.toLowerCase();
            return (
                (row.Type && row.Type.toLowerCase().includes(query)) ||
                (row.Tags && row.Tags.toLowerCase().includes(query)) ||
                (row.Description && row.Description.toLowerCase().includes(query))
            );
        },
        getFilteredData(type) {
            let filteredData = [];

            if (type === 'employer') {
                filteredData = this.data.filter(row => row.Type === 'Employer');
            } else if (type === 'consultant') {
                filteredData = this.data.filter(row =>
                    row.Type === 'Worker' &&
                    row.Tags &&
                    row.Tags.toLowerCase().includes('consultant')
                );
            } else if (type === 'employee') {
                filteredData = this.data.filter(row =>
                    row.Type === 'Worker' &&
                    (!row.Tags || !row.Tags.toLowerCase().includes('consultant'))
                );
            }

            // Apply search filter
            return filteredData.filter(row => this.matchesSearch(row));
        },
        filteredRow(row) {
            const filtered = {};
            ['Type', 'Tags', 'Description'].forEach(key => {
                if (row[key] !== undefined) {
                    filtered[key] = row[key];
                }
            });
            return filtered;
        },
        fetchData() {
            this.loading = true;
            this.error = null;
            const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRMJby7_pkR4q2Pn6giozmvsO0s8f2-28kQuKOyFiUP_w19Wfp_Oxdw2oqyoLizVO40_74m7sflQJV8/pub?gid=0&single=true&output=csv'; // Replace with your actual public CSV URL

            Papa.parse(csvUrl, {
                download: true,
                header: true,
                dynamicTyping: true,
                complete: (results) => {
                    this.loading = false;
                    if (results.data && results.data.length > 0) {
                        this.data = results.data;
                        this.headers = Object.keys(results.data[0] || {});
                    } else {
                        this.data = [];
                        this.headers = [];
                    }
                },
                error: (error) => {
                    this.loading = false;
                    this.error = error.message;
                    console.error('Error fetching or parsing CSV:', error);
                }
            });
        }
    }
}).mount('#app');