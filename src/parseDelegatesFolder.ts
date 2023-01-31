import { Delegate } from "./delegate";
import fs from 'fs';
import path from 'path';
import { parseProfile } from "./parseProfile";
import { parseMetrics } from "./parseMetrics";

export function parseDelegateFolder(delegatesFolderPath: string, folder: string): Delegate {
    const contents = fs.readdirSync(path.join(delegatesFolderPath, folder));
    const image = contents.find(item => item.startsWith('avatar'));

    const profileFilePath = path.join(delegatesFolderPath, folder, 'profile.md');
    const metricsFilePath = path.join(delegatesFolderPath, folder, 'metrics.md');
    const imageFilePath = image ?  path.join(delegatesFolderPath, folder, image) : '';

    if (!fs.existsSync(profileFilePath)) {
        console.error(profileFilePath, "Profile file not found");
        throw new Error("Profile file does not exist for delegate " + folder);
    }
    if (!fs.existsSync(metricsFilePath)) {
        console.error(metricsFilePath, "Metrics file not found");
        throw new Error("Metrics file does not exist for delegate " + folder);
    }

    const profile = parseProfile(profileFilePath);
    const metrics = parseMetrics(metricsFilePath);

    // TODO: Upload image to IPFS and return the hash
    
    return {
        voteDelegateAddress: folder,
        profile,
        image: imageFilePath,
        metrics
    }
}