export default class EmailShareActivity {
  constructor(sharer, sharee, date = null) {
    this.name = 'email:share';
    this.sharer = sharer;
    this.sharee = sharee;
    this.date = date || new Date();
  }
}
