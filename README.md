# Action Deploy Delegates

This action analyzes the configured "delegates" folder and parses the data to create a single array with delegates that gets pushed to a decentralized storage.

## Inputs

### `delegates-folder`

**Required** The path to the folder with the delegates information. Default: `governance/delegates`.

### `tags-file`

**Required** The file with the tags mapping/definitions. Default: `governance/delegates/meta/tags.json`.

### `infura-id`

**Required** Infura IPFS project ID

### `infura-secret`

**Required** Infura IPFS project secret

### `output-file`

If specified, the path of the file to be written to disk

## Outputs

### `hash`

The file hash that has been uploaded to the decentralized storage.

## Example usage

```yaml
uses: makerdao-dux/github-action-deploy-delegates@v1.1.15
with:
  delegates-folder: "governance/delegates"
  tags-file: "governance/delegates/meta/tags.json"
  infura-id: ${{ secrets.INFURA_ID }}
  infura-secret: ${{ secrets.INFURA_KEY }}
```

### Full example: 

```yaml
on: [pull_request, push]

jobs:
  upload_delegates:
    runs-on: ubuntu-latest
    name: Parses all the delegates and uploads all to IPFS
    steps:
      - uses: actions/checkout@v3
      - name: Upload
        id: upload
        uses: makerdao-dux/github-action-deploy-delegates@v1.1.15
        with:
          delegates-folder: 'governance/delegates'
          tags-file: 'governance/delegates/meta/tags.json'
          infura-id: ${{ secrets.INFURA_ID }}
          infura-secret: ${{ secrets.INFURA_KEY }}
          output-file: 'governance/delegates/data.json'
      # Use the output from the `upload` step
      - name: Get the output hash
        run: echo "The IPFS hash was ${{ steps.upload.outputs.hash }}"
```

Based on:
- https://github.com/actions/typescript-action
- https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action