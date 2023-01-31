# Action Deploy Delegates

This action analyzes the configured "delegates" folder and parses the data to create a single array with delegates that gets pushed to a decentralized storage.

## Inputs

### `delegates-folder`

**Required** The path to the folder with the delegates information. Default:  `governance/delegates`.

### `tags-file`

**Required** The file with the tags mapping/definitions. Default: `governance/delegates/meta/tags.json`.

## Outputs

### `hash`

The file hash that has been uploaded to the decentralized storage.

## Example usage

```yaml
uses: actions/action-deploy-delegates@v1.1
with:
  delegates-folder: 'governance/delegates'
  tags-file: 'governance/delegates/meta/tags.json'
```