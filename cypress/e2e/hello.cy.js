describe('Homepage', () => {
    it('should load successfully', () => {
        cy.visit('/');
        cy.contains('Welcome'); // Adjust the text based on your homepage content
    });
});