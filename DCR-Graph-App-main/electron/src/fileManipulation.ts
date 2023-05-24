import * as fs from 'fs'; // Load the File System to execute our common tasks (CRUD)

function saveFile(combinedPath: string, content: any): Promise<boolean> {
    console.log("calling saveFile");
    return new Promise( (resolve, reject) => {
        if (combinedPath === "") {
            reject(new Error("Path empty"));
        }
    
        let serContent = JSON.stringify(content);

        fs.writeFile(combinedPath, serContent, (err: any) => {
            if (err) {
                reject(err);
            }
            resolve(true); 
        });
    });
    
}


function loadFile(fullPath: string): Promise<any> {
    return new Promise( (resolve, reject) => {
        if (fullPath == "") {
            reject(new Error("Path is empty"));
        }
        fs.readFile(fullPath, 'utf-8', (err: any, data: any) => {
            if (err) {
                console.log("An error ocurred reading the file :");
                reject(err);
            }
            try {   
                let content = JSON.parse(data);
                resolve(content);
            } catch (e) {
                reject(e);
            }
            
        });
    });
}


export { saveFile, loadFile };