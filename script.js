const { createApp } = Vue;

createApp({
    data() {
        return {
            title: 'Phoenix Staffing',
            loading: false,
            error: null,
            data: [],
            headers: [],
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
    mounted() {
        this.fetchData();
    },
    methods: {
        toggleSection(section) {
            this.sections[section] = !this.sections[section];
        },
        getFilteredData(type) {
            if (type === 'employer') {
                return this.data.filter(row => row.Type === 'Employer');
            } else if (type === 'consultant') {
                return this.data.filter(row =>
                    row.Type === 'Worker' &&
                    row.Tags &&
                    row.Tags.toLowerCase().includes('consultant')
                );
            } else if (type === 'employee') {
                return this.data.filter(row =>
                    row.Type === 'Worker' &&
                    (!row.Tags || !row.Tags.toLowerCase().includes('consultant'))
                );
            }
            return [];
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