# -Backend-Learning-Project
Learning backend while building one complex project


## Issues Identified in Original Code

### 1. **Mixed Concerns**
- App configuration and server startup are combined in `index.js`
- Makes testing and modular development difficult

### 2. **Poor Error Handling**
- No centralized error handling
- Database connection errors not properly handled

### 3. **Configuration Management**
- Hardcoded values throughout the code
- No environment-based configuration

### 4. **Code Organization**
- Unused imports (`multer` in index.js)
- Inconsistent middleware placement
- No separation of app logic from server startup

### 5. **Graceful Shutdown** 

```javascript
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});
```

### 6. **Code Cleanup** 
**Removed:**
- Unused `multer` import from `index.js`
- Commented code blocks
- Inconsistent spacing and formatting

**Improved:**
- Proper import organization
- Consistent middleware ordering
- Better variable declarations (`const` instead of `let`)
