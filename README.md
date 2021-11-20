# facebook-monica-sync

## Todo

- [x] Export / import of friends (& state?)
  - Ideally also config values
- [x] Add logging
- [x] Auto update `popup.html`
- [x] Move all delays into config file
- [x] Capture profile pictures
- [x] Push all captured data in a note?
- [ ] Add a logo to the button
- [ ] Capture the whole profile and about pages
- [ ] Option to always push a new note to Monica
  - How do we ensure that it's not a duplicate?
  - Maybe need to check all existing notes instead of just 1 as we do currently

## Deduplication

Many contacts in facebook will already exist in Monica. How can we resolve them?

- If the monica contact has a facebook profile id
- If the names are the same

How do we approach this?

- Conservative approach
  - Only push if we find a matching contact on monica
  - Keep all unpushed contacts in a separate collection to be dealt with later
    - Also with their profile images?

## Delayed sync to monica

Let's capture the data first, then push to monica as a second step.

- Save friend data into storage
- Try to match friends by name or by facebook profile
  - If matched, sync data
  - If not matched, move on
- Present a list of unmatched friends
