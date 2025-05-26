/**
 * Un système d'événements personnalisé pour la communication entre composants
 * Permet de notifier tous les composants quand des données sont modifiées,
 * indépendamment de la hiérarchie des composants
 */

const EventBus = {
  events: {},
  
  /**
   * S'abonner à un événement
   * @param {string} event - Nom de l'événement
   * @param {function} callback - Fonction à exécuter quand l'événement est déclenché
   */
  subscribe: function(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    // Retourner une fonction pour se désabonner
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  },
  
  /**
   * Publier un événement
   * @param {string} event - Nom de l'événement
   * @param {any} data - Données à transmettre avec l'événement
   */
  publish: function(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => {
        callback(data);
      });
    }
  }
};

export default EventBus;
